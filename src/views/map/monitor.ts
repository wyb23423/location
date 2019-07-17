import Component, { mixins } from 'vue-class-component';
import MapMixin from '@/mixins/map';
import { arr2obj } from '@/assets/utils/util';
import { BASE_URL, LOSS_TIME } from '@/constant';
import TableMixin from '@/mixins/table';

import Zone from '@/components/monitor/Zone.vue';
import Group from '@/components/monitor/Group.vue';
import Census from '@/components/monitor/Census.vue';
import { FengMapMgr } from '@/assets/map/fengmap';

@Component({
    components: {
        Zone,
        Group,
        Census
    }
})
export default class Monitor extends mixins(MapMixin, TableMixin) {
    public group: { [x: string]: IBaseStation[] } = {}; // 基站分组
    // 右下工具栏列表
    public tools: ToolItem[] = [
        { name: '2D', active: true, display: true },
        { name: '3D', active: false, display: false },
        { name: '区域列表', active: false, display: true },
        { name: '分组列表', active: false, display: true },
        { name: '统计', active: false, display: true }
    ];
    public zoneAll: IZone[] = []; // 区域列表
    public findTarget: string = ''; // 查询标签的标签号

    private baseAll: IBaseStation[] = []; // 基站列表
    private tagAll: { [x: string]: ITag } = {}; // 标签
    private ws: WebSocket[] = [];
    private renderTags: { [x: string]: number } = {}; // 已经在地图上的标签, {tagNo: timer}

    private closePops: Map<string, (immediately?: boolean) => void | true> = new Map(); // 关闭标签信息的函数

    public created() {
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
                this.zoneAll = res[1];
                this.tagAll = arr2obj(res[0], 'tagNo', false);
            });
    }

    public beforeDestroy() {
        let ws = this.ws.pop();
        while (ws) {
            ws.close();
            ws.onmessage = null;
            ws = this.ws.pop();
        }

        Object.values(this.renderTags).forEach(clearTimeout);
    }


    // ==================================dom事件
    // 切换弹窗的显示
    public swithDisplay(i: number) {
        const toolItem = this.tools[i];
        if (i < 2) {
            if (toolItem.active) {
                return;
            }

            const otherMode = this.tools[i ? 0 : 1];
            otherMode.active = !otherMode.active;

            if (this.mgr) {
                this.mgr.switchViewMode();
            }
        }

        toolItem.active = !toolItem.active;
        if (i === 2 || i === 3) {
            const other = this.tools[i === 2 ? 3 : 2];
            if (toolItem.active) {
                other.active = false;
            }
        }
    }

    // 隐藏所有弹窗
    public hiddenCover() {
        for (let i = 2; i < this.tools.length; i++) {
            this.tools[i].active = false;
        }
    }

    // 查询标签
    public find() {
        if (!this.findTarget) {
            return this.$message.warning('请输入标签号');
        }

        if (this.mgr && !this.closePops.has(this.findTarget)) {
            const tag = this.mgr.findSprite(this.findTarget);

            if (tag) {
                this.closePops.set(this.findTarget, this.mgr.addPopInfo(tag));
            } else {
                this.$message.info(`未找到标签号为${this.findTarget}的标签`);
            }
        }

        this.findTarget = '';
    }

    // ==================================

    protected bindEvents() {
        this.mgr!.on('loadComplete', () => {
            if (this.mgr) {
                this.tools[1].display = this.mgr.has3D;

                this.tagAnchor().then(data => {
                    this.baseAll = data;
                    this.group = arr2obj(data, 'groupCode');
                    this.initWebSoket();
                });
            }

        });

        this.mgr!.on('mapClickNode', (event: FMMapClickEvent) => {
            if (this.mgr) {
                if (
                    event.nodeType === fengmap.FMNodeType.IMAGE_MARKER
                    && event.target.custom && event.target.custom.info.tagNo
                ) {
                    const tagNo = event.target.custom.info.tagNo;
                    if (!this.closePops.has(tagNo)) {
                        this.closePops.set(tagNo, this.mgr.addPopInfo(event.target));
                    }
                } else {
                    this.closePops.forEach(fn => fn());
                    this.closePops.clear();
                }
            }
        });
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
                (<any>map).gestureEnableController.enableMapHover = true;
            }

            return this.mgr.addImage(
                {
                    x: info.x,
                    y: info.y,
                    height: 0.5,
                    url: info.photo,
                    size: info.size || 48,
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
        const time = Date.now();

        let ip: string = location.host;
        if (process.env.NODE_ENV !== 'production') {
            const res = BASE_URL.match(/^http:\/\/([\w\d\.]+)\/$/);
            if (res) {
                ip = res[1];
            }
        }

        this.ws = Object.keys(this.group).map(k => {
            const ws = new WebSocket(`ws://${ip}:80/realtime/position/${k}/${time}`);
            ws.onmessage = (event: MessageEvent) => {
                const data: ITagInfo = JSON.parse(event.data);
                if (this.tagAll[data.sTagNo]) {
                    this.move(data);
                }
            };

            return ws;
        });
    }

    // 获取标签位置信息后的处理函数
    private move(tag: ITagInfo) {
        if (!this.mgr) {
            return console.log('获取地图失败!!');
        }

        if (tag.position.every(v => +v >= 0)) {
            const timer = this.renderTags[tag.sTagNo];
            const coord: Vector2 = {
                x: +tag.position[0],
                y: +tag.position[1]
            };

            if (timer) {
                clearTimeout(timer);
                this.mgr.show(tag.sTagNo, true);

                // const reg = new RegExp(`编号:\\s*${tag.sTagNo}`);
                this.mgr.moveTo(tag.sTagNo, coord, 1, (v: Vector2) => {
                    // const pop =
                    //     <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('fm-control-popmarker');
                    // if (pop) {
                    //     for (const el of pop) {
                    //         if (reg.test(el.innerHTML)) {
                    //             Object.assign(el.style, {
                    //                 transition: 'all 120ms ease-out',
                    //                 left: v.x + 'px',
                    //                 top: v.y - 40 + 'px',
                    //                 transform: 'translate(-50%, -100%)'
                    //             });
                    //         }
                    //     }
                    // }
                });
            } else {
                // 第一次收到信号
                const info = {
                    ...this.tagAll[tag.sTagNo],
                    name: tag.sTagNo,
                    tagName: this.tagAll[tag.sTagNo].name,
                    ...coord,
                    callback(im: any) {
                        if (im.alwaysShow) {
                            im.alwaysShow();
                        }
                    }
                };

                const ids = (<any>this.mgr.map).groupIDs;
                this.addIcon(ids ? ids[0] : 0, info);
            }

            // 长时间未收到信号, 发出警告
            this.renderTags[tag.sTagNo] = setTimeout(() => {
                this.$notify.warning(`标签${tag.sTagNo}异常。\n信号丢失!`);

                // delete this.renderTags[tag.sTagNo];
                if (this.mgr) {
                    this.mgr.show(tag.sTagNo, false);
                }
            }, LOSS_TIME);
        }
    }
}

// ===========================================

interface ToolItem {
    name: string; // 显示文字
    active: boolean; // 是否激活
    display: boolean; // 是否显示
}
