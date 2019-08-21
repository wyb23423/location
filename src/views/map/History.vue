<template>
    <div :class="$style.box">
        <div :class="$style['tool-bar']">
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
            ></map-select>
        </div>
        <div ref="map" style="height: 100%; overflow: hidden"></div>
        <history-control
            ref="control"
            :date.sync="date"
            :showPath.sync="showPath"
            :timeRange="timeRange"
            :loadCall="loadCall"
            v-model="progress"
            @play="onPlay"
            @progress="onProgress"
            @pause="onPause"
            @set-icons="setIcons"
        ></history-control>
        <div v-if="isLoading" :class="$style.mark" class="flex-center">
            <i class="el-icon-loading"></i>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { PositionItem, Fragment } from '@/mixins/control';
import MapMixin from '@/mixins/map';
import Control from '@/components/Control.vue';
import localforage from '@/assets/lib/localforage';
import { Ref } from 'vue-property-decorator';

@Component({
    components: { 'history-control': Control }
})
export default class History extends mixins(MapMixin) {
    public date: number[] | null = null; // 选择的时间范围
    public progress: number = 0; // 当前进度
    public loadCall: ((control: Control, index: number) => void) | null = null;
    public isLoading: boolean = false; // 是否当前进度的数据正在加载

    protected renderTags: Set<string> = new Set(); // 已经在地图上的标签

    @Ref('control') private readonly control!: Control;

    private next: PlayRecord = {}; // 下一个数据点
    private moving: Set<string> = new Set(); // 正在移动中的标签
    private fragmentIndex: number = -1; // 当前points所在的片段索引
    private points: Fragment = {}; // 当前进度对应的数据片段
    private icons: Map<string, string> = new Map(); // 标签图标

    public get timeRange() {
        if (!this.date || this.date.length < 2) {
            return 0;
        }

        return this.date[1] - this.date[0];
    }

    public created() {
        this.loadCall = (control: Control, index: number) => {
            if (index === this.fragmentIndex && this.isLoading) {
                this.isLoading = false;
                control.play();
            }
        };
    }

    public setIcons(icons: Map<string, string>) {
        icons.forEach((v, k) => this.icons.set(k, v));
    }

    // 开始播放
    public onPlay() {
        if (!(this.mgr && this.date && this.date.length >= 2)) {
            return;
        }

        this.getFragment()
            .then(() => {
                this.mgr && this.mgr.remove();

                // 移除节点是异步操作
                setTimeout(() => {
                    this.next = {};
                    this.moving.clear();
                    this.renderTags.clear();
                }, 100);
            })
            .catch(console.log);
    }
    // 播放中
    public async onProgress() {
        if (this.fragmentIndex < 0) {
            return;
        }

        const oldFragmentIndex = this.fragmentIndex;
        const oldPoints = this.points;

        try {
            await this.getFragment();
        } catch (e) {
            return console.log(e);
        }

        for (const [tagNo, pointsData] of Object.entries(this.points)) {
            if (this.moving.has(tagNo)) {
                continue;
            }

            Promise.resolve()
                .then(() => {
                    if (!this.mgr) {
                        return Promise.reject('地图不存在');
                    }

                    return this.parseProgress(
                        pointsData,
                        oldFragmentIndex,
                        oldPoints[tagNo] || [],
                        tagNo
                    );
                })
                .then(({ prev, target, record }) => {
                    // 标签此时不在当前地图
                    if (!this.groups.includes(target.group)) {
                        if (this.mgr) {
                            this.mgr.remove(tagNo); // 移除标签
                            this.mgr.lineMgr.remove(tagNo); // 移除对应的轨迹线
                        }

                        return this.renderTags.delete(tagNo); // 移除渲染记录
                    }

                    // ===============================================
                    if (!(prev && this.renderTags.has(tagNo))) {
                        // 将标签添加到地图中
                        this.start(target, tagNo);
                    } else {
                        const time = target.time - prev.time + record.errorTime;
                        this.moveTo(tagNo, target, time).then(() =>
                            this.moving.delete(tagNo)
                        );
                        this.moving.add(tagNo);
                        record.index++;
                        this.next[tagNo] = record;
                    }
                })
                .catch(console.log);
        }
    }

    // 暂停
    public onPause() {
        this.mgr && this.mgr.stopMoveTo();
    }

    // 进度更新时获取相关数据点
    private async parseProgress(
        pointsData: PositionItem[],
        oldFragmentIndex: number,
        old: PositionItem[] | undefined,
        tagNo: string
    ): Promise<ProgressData> {
        const record = this.next[tagNo] || {
            index: 0,
            errorTime: 0
        };

        let target: PositionItem | undefined | null; // 本次数据点
        let prev: PositionItem | undefined | null; // 上一次数据点
        if (oldFragmentIndex === this.fragmentIndex) {
            // ====================================未更换数据片段
            target = pointsData[record.index];
            prev = pointsData[record.index - 1];
        } else {
            // ======================================已更换数据片段
            target = pointsData[0];
            prev = old ? old.pop() : null;
        }

        if (!target) {
            if (
                !pointsData.length || // 当前数据片段数据为空
                this.control.count <= this.fragmentIndex + 1 // 播放完毕
            ) {
                this.mgr && this.mgr.remove(tagNo);
                return Promise.reject();
            } else {
                // =========================时间点落在一个数据片段最后一个数据及下一个数据片段开始之间
                try {
                    const data = await localforage.getItem<Fragment>(
                        this.fragmentIndex + 1 + ''
                    );

                    return this.parseProgress(
                        data[tagNo] || [],
                        oldFragmentIndex,
                        old,
                        tagNo
                    );
                } catch (e) {
                    return this.loading();
                }
            }
        }

        return { target, prev, record };
    }

    private start(target: PositionItem, tagNo: string) {
        if (!(this.mgr && this.date && this.date.length >= 2)) {
            return;
        }

        const playTime = (this.timeRange * this.progress) / 100;
        const startTime = target.time - this.date[0];

        if (playTime >= startTime) {
            this.mgr.addImage(
                {
                    x: target.x,
                    y: target.y,
                    height: 0.5,
                    url: this.icons.get(tagNo),
                    size: 48
                },
                tagNo,
                undefined,
                false
            );

            this.renderTags.add(tagNo);
            this.next[tagNo] = {
                index: 1,
                errorTime: 0
            };
        }
    }

    // 获取数据片段
    private getFragment() {
        return Promise.resolve()
            .then(() => {
                const fragmentIndex = this.control.index;

                if (fragmentIndex !== this.fragmentIndex) {
                    this.fragmentIndex = fragmentIndex;
                    return localforage.getItem<Fragment>(fragmentIndex + '');
                }

                return this.points;
            })
            .then(points => (this.points = points))
            .catch(this.loading.bind(this));
    }

    // 数据加载中...
    private loading() {
        this.isLoading = true;
        this.control.pause();

        return Promise.reject('loading...');
    }
}

interface PlayRecord {
    [x: string]: PlayRecordItem;
}
interface PlayRecordItem {
    index: number;
    errorTime: number;
}

interface ProgressData {
    record: PlayRecordItem;
    target: PositionItem;
    prev?: PositionItem | null;
}
</script>

<style lang="postcss" module>
.box {
    position: relative;
    height: 100%;
}

.tool-bar {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 60px;
    background: #fcf8e3;
    display: flex;
    align-items: center;
}

.mark {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 9999;
    background: #fff;
    opacity: 0.6;
    font-size: 48px;
}
</style>
