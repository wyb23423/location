/**
 * 实时监控关于地图上的操作
 */

import Component, { mixins } from 'vue-class-component';
import MapMixin from './map';
import { arr2obj } from '@/assets/utils/util';
import { BASE_URL, LOSS_TIME } from '@/constant';
import { FengMapMgr } from '@/assets/map/fengmap';

interface Pop {
    close(immediately?: boolean): void | boolean;
    update?(): boolean;
}


@Component
export default class MonitorMixin extends mixins(MapMixin) {
    protected renderTags: { [x: string]: number } = {}; // 已经在地图上的标签, {tagNo: timer}

    private tagAll!: { [x: string]: ITag }; // 标签
    private baseAll: IBaseStation[] = []; // 基站列表
    private ws: WebSocket[] = [];
    private pops: Map<string, Pop> = new Map(); // 关闭标签信息的函数
    private infoArr: string[] = [];
    private timer: number = 0;

    private get ip() {
        let ip: string = location.hostname;
        if (process.env.NODE_ENV !== 'production') {
            const res = BASE_URL.match(/^http:\/\/([\w\d\.]+)(:\d+)?\/$/);
            if (res) {
                ip = res[1];
            } else {
                return console.error('域名解析失败');
            }
        }

        return ip;
    }

    public created() {
        this.tagAll = {};

        Promise.all(['tag', 'zone'].map(async v => {
            try {
                const res = await this.$http.get(`/api/${v}/getall`, {
                    currentPage: 1,
                    pageSize: 1_0000_0000
                });

                return res.pagedData.datas;
            } catch (e) {
                return [];
            }
        }))
            .then(res => {
                this.setData('zoneAll', res[1]);
                this.tagAll = arr2obj(res[0], 'tagNo', false);
            });

        this.warning();
    }

    public beforeDestroy() {
        this.closeWebSocket(); // 关闭wenSocket连接

        Object.values(this.renderTags).forEach(clearTimeout);
        this.pops.forEach(v => v.close());

        this.tagAll = {};
        cancelAnimationFrame(this.timer);
    }

    // 在地图上显示标签信息
    protected showInfo(key: string, isName: number) {
        if (this.mgr && !this.pops.has(key)) {
            const tags = this.mgr.find(key, !!isName);

            if (tags.length) {
                tags.forEach(v => {
                    const info = v.custom && v.custom.info ? v.custom.info : null;
                    if (info) {
                        this.pops.set(info.name, this.mgr!.addPopInfo(v));
                    }
                });
            } else {
                this.$message.info(`未找到标签${key}为${key}的标签`);
            }
        }
    }

    protected bindEvents() {
        this.initWebSoket();

        this.mgr!.on('loadComplete', () => {
            // 清空已显示的标签的记录
            Object.values(this.renderTags).forEach(clearTimeout);
            this.renderTags = {};

            // 移除所有信息窗
            this.pops.forEach(v => v.close());
            this.pops.clear();

            // 移除路径
            this.showPath = false;
            // 清空报警列表
            this.infoArr.length = 0;

            // 渲染基站
            this.tagAnchor().then(data => {
                this.baseAll = data;
                this.setData('groupData', arr2obj(data, 'groupCode'));
            });

            this.init();
        });

        this.mgr!.on('mapClickNode', (event: FMMapClickEvent) => {
            if (this.mgr) {
                if (
                    event.nodeType === fengmap.FMNodeType.IMAGE_MARKER
                    && event.target.custom && event.target.custom.info.tagNo
                ) {
                    const tagNo = event.target.custom.info.tagNo;
                    if (!this.pops.has(tagNo)) {
                        this.pops.set(tagNo, this.mgr.addPopInfo(<any>event.target));
                    }
                } else {
                    for (const [k, p] of this.pops.entries()) {
                        if (p.close()) {
                            this.pops.delete(k);
                        }
                    }
                }
            }
        });
    }

    protected init() {
        // 其他地图创建后的初始化操作
    }

    protected setData(key: string, data: any) {
        // 设置实例数据
    }

    // 获取并显示基站
    private async tagAnchor() {
        try {
            let data: IBaseStation[] = [...this.baseAll];
            if (!data.length) {
                const res = await this.$http.get('/api/base/getall', {
                    currentPage: 1,
                    pageSize: 10000
                });
                data = res.pagedData.datas;
            }


            if (this.mgr) {
                for (const v of data) {
                    // 添加基站图标
                    this.addIcon(
                        1,
                        {
                            x: v.coordx,
                            y: v.coordy,
                            name: v.baseNo,
                            groupid: v.groupCode,
                            photo: '/images/anchor.png',
                            size: 32
                        },
                        2
                    );

                    // 添加基站名
                    this.mgr.addTextMarker(
                        {
                            height: 2,
                            fillcolor: '#009688',
                            fontsize: 15,
                            type: 1,
                            strokecolor: '255,255,0',
                            x: v.coordx,
                            y: v.coordy - 40
                        },
                        v.baseNo + ''
                    );
                }
            }

            return data;
        } catch (e) {
            return [];
        }
    }

    private addIcon(gid: number, info: any, type: number = 1) {
        if (this.mgr) {
            const map = this.mgr.map;
            if (this.mgr instanceof FengMapMgr) {
                (<fengmap.FMMap>map).gestureEnableController.enableMapHover = true;
            }

            return this.mgr.addImage(
                {
                    x: info.x,
                    y: info.y,
                    height: 1,
                    url: info.photo,
                    size: info.size || 24,
                    callback: (im: any) => {
                        if (!im.custom) {
                            im.custom = {};
                        }

                        Object.assign(im.custom, { type, info });

                        if (info.callback) {
                            info.callback(im);
                        }
                    }
                },
                info.name, gid,
                !!info.isMapCoor
            );
        }
    }

    private initWebSoket() {
        this.closeWebSocket();

        const ip = this.ip;
        if (!ip) {
            return;
        }

        // ==============================收到标签信息后的处理
        const datas: any[] = [];
        let time: number = 0;
        const handler = (event: MessageEvent) => {
            const data: ITagInfo = JSON.parse(event.data);
            if (this.tagAll[data.sTagNo]) {
                datas.push(data);
                if (Date.now() - time > 50 / 3) {
                    datas.forEach(v => this.move(v));
                    datas.length = 0;
                    time = Date.now();
                }
            }
        };
        // ======================================

        // 两套后台建立websocket方式不同，通过配置确定(暂定)
        const countConfig = JSON.parse(sessionStorage.getItem('config')!).SOCKET_COUNT;
        if (countConfig === 'multiple') {
            const t = Date.now();
            this.ws = this.groups.map(k => {
                const ws = new WebSocket(`ws://${ip}/realtime/position/${k}/${t}`);
                ws.onmessage = handler;
                return ws;
            });
        } else {
            const ws = new WebSocket(`ws://${ip}/realtime/position`);
            ws.onmessage = handler;
            this.ws = [ws];
        }
    }

    private closeWebSocket() {
        let ws = this.ws.pop();
        while (ws) {
            ws.close();
            ws.onmessage = null;
            ws = this.ws.pop();
        }
    }

    // 获取标签位置信息后的处理函数
    private move(tag: ITagInfo) {
        if (!this.mgr) {
            return console.log('获取地图失败!!');
        }

        if (tag.position.every(v => +v >= 0)) {
            const timer = this.renderTags[tag.sTagNo];
            const coord: Vector3 = {
                x: +tag.position[0],
                y: +tag.position[1],
                z: 1
            };
            if (timer) {
                clearTimeout(timer);
                this.mgr.show(tag.sTagNo, true);
                this.moveTo(
                    tag.sTagNo, coord, 1,
                    () => {
                        const p = this.pops.get(tag.sTagNo);
                        if (p && p.update) {
                            p.update() || this.pops.delete(tag.sTagNo);
                        }
                    }
                );
            } else {
                // 第一次收到信号
                const tagData: ITag = this.tagAll[tag.sTagNo];
                const info = {
                    ...(tagData || {}),
                    name: tag.sTagNo,
                    tagName: tagData ? tagData.name : '未知标签',
                    ...coord
                };

                const ids = (<any>this.mgr.map).groupIDs;
                this.addIcon(ids ? ids[0] : 0, info);
            }

            // 长时间未收到信号, 将标签号推入信号丢失报警队列
            this.renderTags[tag.sTagNo] = setTimeout(() => this.infoArr.push(tag.sTagNo), LOSS_TIME);
        }
    }

    // 信号丢失报警循环
    private warning() {
        const tagNo = this.infoArr.shift();

        if (tagNo && this.renderTags[tagNo] !== -1) {
            this.$notify.warning(`标签${tagNo}异常。信号丢失!`);

            if (this.mgr) {
                this.mgr.show(tagNo, false);
                this.renderTags[tagNo] = -1;

                if (this.pops.has(tagNo)) {
                    (<Pop>this.pops.get(tagNo)).close(true);
                    this.pops.delete(tagNo);
                }
            }
        }

        this.timer = requestAnimationFrame(this.warning.bind(this));
    }
}
