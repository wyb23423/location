import Component, { mixins } from 'vue-class-component';
import MapMixin from '../map';
import { WebSocketInit } from './websocket';
import { getConfig } from '@/assets/utils/util';
import { LOSS_TIME, MODIFY_TAG_ICON, MISS } from '@/constant';
import Link from '../map/link';
import { getCustomInfo } from '@/assets/map/common';

interface Pop {
    close(clickIconTime?: number): void | boolean;
    updateInfo(info: ITagInfo): boolean;
    updatePosition?(): boolean;
}

@Component
export default class MonitorMixin extends mixins(MapMixin, WebSocketInit, Link) {
    public renderTags: Record<string, number> = {}; // 已经在地图上的标签, {tagNo: timer}

    private pops: Map<string, Pop> = new Map(); // 关闭标签信息的函数
    private readonly moveTime = 1 / getConfig<number>('SECOND_COUNT', 1);
    private clickIconTime?: number;

    public created() {
        this.on(MODIFY_TAG_ICON, (name: string, img: string) => this.mgr && this.mgr.modifyImg(name, img))
            .on(MISS, this.miss.bind(this)); // 信号丢失的全局事件;
    }

    public beforeDestroy() {
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
                this.$message.info(`未找到标签${isName ? '名' : '号'}为${key}的标签`);
            }
        }
    }

    protected bindEvents() {
        this.mgr!.on('loadComplete', this.mapCreated.bind(this));

        this.mgr!.on('mapClickNode', (event: FMMapClickEvent) => {
            if (this.mgr) {
                const tagNo = getCustomInfo<ITag>(event.target, 'info').id;
                if (event.nodeType === fengmap.FMNodeType.IMAGE_MARKER && tagNo) {
                    this.pops.has(tagNo) || this.pops.set(tagNo, this.mgr.addPopInfo(<any>event.target));
                    this.clickIconTime = Date.now();
                } else {
                    for (const [k, p] of this.pops.entries()) {
                        p.close(this.clickIconTime) && this.pops.delete(k);
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
    protected handler(tag: ITagInfo) {
        if (!this.mgr) {
            return console.log('获取地图失败!!');
        }

        const renderTags = this.renderTags;

        const tagNo = tag.sTagNo;
        const timer = renderTags[tagNo];
        const coord: Vector3 = {
            x: +tag.position[0],
            y: +tag.position[1],
            z: 1
        };

        if (timer) {
            clearTimeout(timer);
            this.moveTo(tagNo, coord, this.moveTime, () => this.updateCall(tag, false));
        } else {
            this.addTag(tagNo, coord);
            renderTags[tagNo] = 1;
        }

        this.updateCall(tag, true); // 更新面板信息

        // 统计(添加对应统计信息)
        this.doCensus(tag);
    }

    // 信号丢失报警循环
    private miss(tagNo: string) {
        clearTimeout(this.renderTags[tagNo]);

        if (this.mgr) {
            this.renderTags[tagNo] = -1; // 标记标签已丢失

            this.mgr.show(tagNo, false); // 隐藏标签
            this.mgr.lineMgr.remove(tagNo); // 移除轨迹线
            this.doCensus(tagNo); // 更新统计数据(移除对应统计信息)

            // 移除信息框
            const pop = this.pops.get(tagNo);
            pop && pop.close(0);
            this.pops.delete(tagNo);
        }
    }

    /**
     * 更新标签信息面板
     * @param tag 信息数据
     * @param isUpdateInfo 是否是更新面板中的信息。为false时更新位置，true时更新信息
     */
    private updateCall(tag: ITagInfo, isUpdateInfo?: boolean) {
        const tagNo = tag.sTagNo;
        const p = this.pops.get(tagNo);
        if (p) {
            let canUpdate = true;
            if (isUpdateInfo) {
                canUpdate = p.updateInfo(tag);
            } else if (p.updatePosition) {
                canUpdate = p.updatePosition();
            }

            canUpdate || this.pops.delete(tagNo);
        }
    }

    // 地图创建完成的回调
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
        this.tagAnchor();

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
        const tagData = this.tagAll.get(tagNo)!;
        this.addIcon(ids[0] || 0, {
            ...tagData,
            ...coord,
            name: tagNo,
            tagName: tagData.name,
        });
    }
}
