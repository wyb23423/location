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
            :timeRange="timeRange"
            :tags="tags"
            :loadCall="loadCall"
            v-model="progress"
            @play="onPlay"
            @progress="onProgress"
            @pause="onPause"
            @pathVisible="switchVisible"
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

@Component({
    components: { 'history-control': Control }
})
export default class History extends mixins(MapMixin) {
    public date: number[] | null = null; // 选择的时间范围
    public progress: number = 0; // 当前进度
    public loadCall: ((control: Control, index: number) => void) | null = null;
    public tags: ITag[] = [];
    public isLoading: boolean = false; // 是否当前进度的数据正在加载

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
        this.fetchTags();

        this.loadCall = (control: Control, index: number) => {
            if (index === this.fragmentIndex && this.isLoading) {
                this.isLoading = false;
                control.play();
            }
        };
    }

    // 开始播放
    public onPlay() {
        if (!(this.mgr && this.date && this.date.length >= 2)) {
            return;
        }

        this.getFragment()
            .then(() => {
                this.mgr && this.mgr.remove();
                setTimeout(() => {
                    this.next = {};
                    this.moving.clear();
                }, 100);
            })
            .catch(console.log);
    }
    // 播放中
    public onProgress() {
        if (this.fragmentIndex < 0) {
            return;
        }

        const oldFragmentIndex = this.fragmentIndex;
        const oldPoints = this.points;

        this.getFragment()
            .then(() => {
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
                            if (!prev) {
                                // 将标签添加到地图中
                                this.start(target, tagNo);
                            } else {
                                const time =
                                    target.time - prev.time + record.errorTime;
                                this.mgr &&
                                    this.mgr.moveTo(
                                        tagNo,
                                        target,
                                        time / 1000,
                                        undefined,
                                        () => this.moving.delete(tagNo)
                                    );

                                this.moving.add(tagNo);

                                record.index++;
                                this.next[tagNo] = record;
                            }
                        })
                        .catch(console.log);
                }
            })
            .catch(console.log);
    }

    // 暂停
    public onPause() {
        if (this.mgr) {
            this.mgr.stopMoveTo();
        }

        return this;
    }

    // 切换路径显示状态
    public switchVisible(visible: boolean) {
        // if (this.path && this.mgr) {
        //     if (visible) {
        //         for (const v of this.path) {
        //             const points = [v.position[0]];
        //             for (
        //                 let i = 1;
        //                 i < v.position.length - 1;
        //                 i += Math.ceil(v.position.length / 300)
        //             ) {
        //                 points.push(v.position[i]);
        //             }
        //             points.push(v.position[v.position.length - 1]);
        //             this.mgr.addLine(
        //                 points,
        //                 {
        //                     lineType: fengmap.FMLineType.FULL,
        //                     lineWidth: 2
        //                 },
        //                 v.id
        //             );
        //         }
        //     } else {
        //         this.mgr.lineMgr.remove();
        //     }
        // }
    }

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

        let target: PositionItem | undefined | null;
        let prev: PositionItem | undefined | null;
        if (oldFragmentIndex === this.fragmentIndex) {
            target = pointsData[record.index];
            prev = pointsData[record.index - 1];
        } else {
            target = pointsData[0];
            prev = old ? old.pop() : null;
        }

        if (!target) {
            if (
                !pointsData.length ||
                (<Control>this.$refs.control).count <= this.fragmentIndex + 1
            ) {
                this.mgr && this.mgr.remove(tagNo);
                return Promise.reject();
            } else {
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
                    url:
                        this.icons.get(tagNo) ||
                        '/image/d7e6933a6db64df798e6dc027d2532a7.png',
                    size: 48
                },
                tagNo,
                undefined,
                false
            );

            this.next[tagNo] = {
                index: 1,
                errorTime: 0
            };
        }
    }

    private fetchTags() {
        this.$http
            .get('/api/tag/getall', {
                pageSize: 1000000,
                currentPage: 1
            })
            .then(res => {
                this.tags = (<ITag[]>res.pagedData.datas).map(v => {
                    this.icons.set(v.tagNo, v.photo);
                    return v;
                });
            })
            .catch(console.log);
    }

    private getFragment() {
        return Promise.resolve()
            .then(() => {
                const fragmentIndex = (<Control>this.$refs.control).index;

                if (fragmentIndex !== this.fragmentIndex) {
                    this.fragmentIndex = fragmentIndex;
                    return localforage.getItem<Fragment>(fragmentIndex + '');
                }

                return this.points;
            })
            .then(points => (this.points = points))
            .catch(this.loading.bind(this));
    }

    private loading() {
        this.isLoading = true;
        (<Control>this.$refs.control).pause();

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
