import Component, { mixins } from 'vue-class-component';
import MapMixin from '../map';
import { WebSocketInit } from './websocket';
import { getConfig } from '@/assets/utils/util';
import { MODIFY_TAG_ICON, MISS } from '@/constant';
import Link from '../map/link';
import { getCustomInfo } from '@/assets/map/common';

interface Pop {
    close(clickIconTime?: number): void | boolean;
    updateInfo(info: ITagInfo): boolean;
    updatePosition?(): boolean;
}

@Component
export default class MonitorMixin extends mixins(MapMixin, WebSocketInit, Link) {
    public censusChange: number = 0; // 用于触发响应（当前vue版本不支持Map及Set的数据响应）
    protected censusTags = new Map<string, Set<string>>(); // 分组统计
    private tagGroup = new Map<string, string>(); // tag-group映射, 也用于判断标签是否已添加到地图上
    private time?: number; // 统计刷新时间戳

    private pops: Map<string, Pop> = new Map(); // 关闭标签信息的函数
    private readonly moveTime = 1 / getConfig<number>('SECOND_COUNT', 1);
    private clickIconTime?: number;

    public created() {
        this.on(MODIFY_TAG_ICON, (name: string, img: string) => this.mgr && this.mgr.modifyImg(name, img))
            .on(MISS, this.miss.bind(this)); // 信号丢失的全局事件;
    }

    public beforeDestroy() {
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

    /**
     * 在地图上创建基站后对基站数据的其他处理逻辑
     * @param data 基站数据
     */
    protected initBases(data: IBaseStation[]) {
        //
    }

    /**
     * 地图创建完成后的操作
     */
    protected afterMapCreated() {
        //
    }

    // 获取标签位置信息后的处理函数
    protected handler(tag: ITagInfo) {
        if (!this.mgr) {
            return console.log('获取地图失败!!');
        }

        const tagNo = tag.sTagNo;
        const coord: Vector3 = {
            x: +tag.position[0],
            y: +tag.position[1],
            z: 1
        };

        if (this.tagGroup.has(tagNo)) {
            this.moveTo(tagNo, coord, this.moveTime, () => this.updateCall(tag, false));
        } else {
            this.addTag(tagNo, coord);
        }

        this.updateCall(tag, true); // 更新面板信息

        // 统计(添加对应统计信息)
        this.doCensus(tag);
    }

    protected invalid(tag: ITagInfo) {
        this.miss(tag.sTagNo);
    }

    // 信号丢失报警循环
    private miss(tagNo: string) {
        if (!(this.mgr && this.tagGroup.has(tagNo))) {
            return;
        }

        this.mgr.show(tagNo, false); // 隐藏标签
        this.mgr.lineMgr.remove(tagNo); // 移除轨迹线
        this.doCensus(tagNo); // 更新统计数据(移除对应统计信息)

        // 移除信息框
        const pop = this.pops.get(tagNo);
        pop && pop.close(0);
        this.pops.delete(tagNo);
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

    /**
     * 地图创建完成的回调
     */
    private mapCreated() {
        // 清除当前在缓冲区的数据
        this.data.length = 0;

        // 清空统计的标签的记录
        this.censusTags.clear();
        this.tagGroup.clear();
        this.updateCensus();

        // 移除所有信息窗
        this.pops.forEach(v => v.close());
        this.pops.clear();

        // 移除路径
        this.showPath = false;

        // 渲染基站
        this.tagAnchor().then(this.initBases.bind(this));

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

    private doCensus(tag: ITagInfo | string) {
        const tagNo = (<ITagInfo>tag).sTagNo || <string>tag;
        const group = this.tagGroup.get(tagNo);

        let hasUpdate = false; // 是否有更新
        if (group) {
            const set = this.censusTags.get(group);
            hasUpdate = !!(set && set.delete(tagNo));
        }

        if (typeof tag !== 'string') {
            const set = this.censusTags.get(tag.groupNo) || new Set();
            const oldSize = set.size;
            set.add(tagNo);

            hasUpdate = hasUpdate || oldSize !== set.size;
            this.censusTags.set(tag.groupNo, set);
            this.tagGroup.set(tagNo, tag.groupNo);
        }

        if (hasUpdate) {
            const now = Date.now();
            if (!this.time || now - this.time >= 1000) {
                this.updateCensus(now);
            }
        }
    }

    private updateCensus(now = Date.now()) {
        this.censusChange = this.censusChange ? 0 : 1;
        this.time = now;
    }
}
