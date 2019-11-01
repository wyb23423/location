import Component, { mixins } from 'vue-class-component';
import MapMixin from '../map';
import { WebSocketInit } from './websocket';
import { arr2obj, getConfig } from '@/assets/utils/util';
import { LOSS_TIME, MODIFY_TAG_ICON, MISS } from '@/constant';
import Link from '../map/link';
import { getCustomInfo } from '@/assets/map/common';

interface Pop {
    close(immediately?: boolean): void | boolean;
    update(iHeartRate: number): boolean;
}

@Component
export default class MonitorMixin extends mixins(MapMixin, WebSocketInit, Link) {
    public renderTags: Record<string, number> = {}; // 已经在地图上的标签, {tagNo: timer}

    private pops: Map<string, Pop> = new Map(); // 关闭标签信息的函数
    private readonly moveTime = 1 / getConfig<number>('SECOND_COUNT', 1);

    public created() {
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
                tags.forEach((v: any) => {
                    const name = getCustomInfo<ITag>(v, 'info').name;
                    name && this.pops.set(name, this.mgr!.addPopInfo(v));
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
                const tagNo = getCustomInfo<ITag>(event.target, 'info').tagNo;
                if (event.nodeType === fengmap.FMNodeType.IMAGE_MARKER && tagNo) {
                    if (!this.pops.has(tagNo)) {
                        this.pops.set(tagNo, this.mgr.addPopInfo(<any>event.target));
                    }
                } else {
                    for (const [k, p] of this.pops.entries()) {
                        p.close() && this.pops.delete(k);
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
    protected doMonitor(tag: ITagInfo) {
        if (!this.mgr) {
            return console.log('获取地图失败!!');
        }

        const tagNo = tag.sTagNo;
        const timer = this.renderTags[tagNo];
        const coord: Vector3 = {
            x: +tag.position[0],
            y: +tag.position[1],
            z: 1
        };

        if (timer) {
            clearTimeout(timer);

            const update = () => {
                const p = this.pops.get(tagNo);
                if (p && p.update) {
                    p.update(tag.iHeartRate) || this.pops.delete(tagNo);
                }
            };

            if (+tag.position[0] >= 1000) {
                this.exitAnimation(tagNo);
                update();
            } else {
                this.moveTo(tagNo, coord, this.moveTime, update);
            }

        } else {
            this.addTag(tagNo, coord);
            this.renderTags[tagNo] = 1;
        }

        if (!tag.static) {
            // 长时间未收到信号, 将标签号推入信号丢失队列
            this.renderTags[tagNo] = setTimeout(this.miss.bind(this, tagNo), LOSS_TIME);
        }

        // 统计(添加对应统计信息)
        this.doCensus(tag);
    }

    // 信号丢失报警循环
    private miss(tagNo: string) {
        this.$event.emit(MISS, tagNo);

        if (this.mgr) {
            this.renderTags[tagNo] = -1; // 标记标签已丢失

            this.mgr.show(tagNo, false); // 隐藏标签
            this.mgr.lineMgr.remove(tagNo); // 移除轨迹线
            this.doCensus(tagNo); // 更新统计数据(移除对应统计信息)

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
        this.tagAnchor().then(data => Reflect.set(this, 'groupData', arr2obj(data, 'groupCode')));

        this.afterMapCreated();
    }

    private addTag(tagNo: string, coord: Vector3) {
        let ids: number[] = [];
        try {
            ids = (<any>this.mgr!.map).groupIDs || [];
        } catch (e) {
            // 地图初始化未完成
            return;
        }

        // 第一次收到信号
        const tagData: ITag = this.tagAll[tagNo];
        this.addIcon(ids[0] || 0, {
            ...tagData,
            ...coord,
            name: tagNo,
            tagName: tagData.name,
        });
    }
}
