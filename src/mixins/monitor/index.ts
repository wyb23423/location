import Component, { mixins } from 'vue-class-component';
import MapMixin from '../map';
import { WebSocketInit } from './websocket';
import { arr2obj } from '@/assets/utils/util';
import { LOSS_TIME, MODIFY_TAG_ICON, NOTIFY_KEY, MISS_MSG, ALARM_DEAL } from '@/constant';
import Link from '../map/link';

interface Pop {
    close(immediately?: boolean): void | boolean;
    update?(): boolean;
}

@Component
export default class MonitorMixin extends mixins(MapMixin, WebSocketInit, Link) {
    public renderTags: Record<string, number> = {}; // 已经在地图上的标签, {tagNo: timer}

    private pops: Map<string, Pop> = new Map(); // 关闭标签信息的函数
    private zoneAll: IZone[] = []; // 所有区域
    private alarmTimes = new Map<string, number>();
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

        this.$event.on(MODIFY_TAG_ICON, (tagNo: string, img: string) => this.mgr && this.mgr.modifyImg(tagNo, img));
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

        const tagNo = tag.sTagNo;
        if (tag.position.every(v => +v >= 0)) {
            const timer = this.renderTags[tagNo];
            const coord: Vector3 = {
                x: +tag.position[0],
                y: +tag.position[1],
                z: 1
            };
            if (timer) {
                clearTimeout(timer);

                this.$event.emit(ALARM_DEAL, {
                    tagNo,
                    alarmTime: this.alarmTimes.get(tagNo),
                    alarmMsg: MISS_MSG,
                    type: 1
                });

                this.moveTo(
                    tagNo, coord, 1,
                    () => {
                        const p = this.pops.get(tagNo);
                        if (p && p.update) {
                            p.update() || this.pops.delete(tagNo);
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
                const tagData: ITag = this.tagAll[tagNo];
                this.addIcon(ids ? ids[0] : 0, {
                    ...(tagData || {}),
                    name: tagNo,
                    tagName: tagData ? tagData.name : '未知标签',
                    ...coord
                });
            }

            // 长时间未收到信号, 将标签号推入信号丢失报警队列
            this.renderTags[tagNo] = setTimeout(this.miss.bind(this, tagNo), LOSS_TIME);

            // 统计
            this.doCensus(tag);
        }
    }

    // 信号丢失报警循环
    private miss(tagNo: string) {
        const now = Date.now();
        this.alarmTimes.set(tagNo, now);
        // 抛出 信号丢失 事件
        this.$event.emit(NOTIFY_KEY, {
            tagNo,
            alarmTime: now,
            alarmMsg: MISS_MSG,
            type: 1
        });

        if (this.mgr) {
            this.renderTags[tagNo] = -1; // 标记标签已丢失

            this.mgr.show(tagNo, false); // 隐藏标签
            this.mgr.lineMgr.remove(tagNo); // 移除轨迹线
            this.doCensus(tagNo); // 更新统计数据

            // 移除信息框
            if (this.pops.has(tagNo)) {
                (<Pop>this.pops.get(tagNo)).close(true);
                this.pops.delete(tagNo);
            }
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
}
