import Component, { mixins } from 'vue-class-component';
import MapMixin from '../map';
import { WebSocketInit } from './websocket';
import { arr2obj } from '@/assets/utils/util';
import { LOSS_TIME, MODIFY_TAG_ICON, NOTIFY_KEY } from '@/constant';

interface Pop {
    close(immediately?: boolean): void | boolean;
    update?(): boolean;
}

@Component
export default class MonitorMixin extends mixins(MapMixin, WebSocketInit) {
    public renderTags: { [x: string]: number } = {}; // 已经在地图上的标签, {tagNo: timer}

    private pops: Map<string, Pop> = new Map(); // 关闭标签信息的函数
    private zoneAll: IZone[] = []; // 所有区域

    private getZones?: () => void;

    public created() {
        // 获取区域数据
        this.$http.get('/api/zone/getall', {
            currentPage: 1,
            pageSize: 1_0000_0000
        })
            .then(res => this.zoneAll = res.pagedData.datas)
            .then(() => this.getZones && this.getZones())
            .catch(() => console.log);

        this.$event.on(MODIFY_TAG_ICON, this.modifyImg.bind(this));
    }

    public beforeDestroy() {
        this.$event.off(MODIFY_TAG_ICON);

        Object.values(this.renderTags).forEach(clearTimeout);
        this.pops.forEach(v => v.close());
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
        this.mgr!.on('loadComplete', this.mapCreated.bind(this));

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

    protected afterMapCreated() {
        // 其他地图创建完成后的操作
    }
    protected doCensus(tag: ITagInfo | string) {
        //
    }

    // 获取标签位置信息后的处理函数
    protected move(tag: ITagInfo) {
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
                let ids = [];
                try {
                    ids = (<any>this.mgr.map).groupIDs;
                } catch (e) {
                    // 地图初始化未完成
                    return;
                }

                // 第一次收到信号
                const tagData: ITag = this.tagAll[tag.sTagNo];
                this.addIcon(ids ? ids[0] : 0, {
                    ...(tagData || {}),
                    name: tag.sTagNo,
                    tagName: tagData ? tagData.name : '未知标签',
                    ...coord
                });
            }

            // 长时间未收到信号, 将标签号推入信号丢失报警队列
            this.renderTags[tag.sTagNo] = setTimeout(() => {
                this.$event.emit(NOTIFY_KEY, {
                    tagNo: tag.sTagNo,
                    alarmTime: Date.now(),
                    alarmMsg: '信号丢失',
                    type: 1
                });
            }, LOSS_TIME);

            // 统计
            this.doCensus(tag);
        }
    }

    private mapCreated() {
        // 清空已显示的标签的记录
        Object.values(this.renderTags).forEach(clearTimeout);
        this.renderTags = {};

        // 移除所有信息窗
        this.pops.forEach(v => v.close());
        this.pops.clear();

        // 移除路径
        this.showPath = false;

        // 渲染基站
        this.tagAnchor()
            .then(data => {
                this.getZones = () => Reflect.set(this, 'zones', this.filterZoneAll(data));
                this.getZones();

                Reflect.set(this, 'groupData', arr2obj(data, 'groupCode'));
            });

        this.afterMapCreated();
    }

    private filterZoneAll(data: IBaseStation[]) {
        const ids = new Set(data.map(v => +v.zone));
        return this.zoneAll.filter(v => ids.has(v.id));
    }

    private modifyImg(tagNo: string, isError: boolean) {
        this.mgr && this.mgr.modifyImg(tagNo, isError ? '/images/error.png' : '');
    }
}
