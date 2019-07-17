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
            :date.sync="date"
            :path.sync="path"
            @play="play"
            @progress="progress"
            @pause="pause"
            @pathVisible="switchVisible"
        ></history-control>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import MapMixin from '@/mixins/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import Control, { HistoryPath, PositionItem } from '@/components/Control.vue';
import { WorkerObj } from '@/vue';
import { randomColor } from '@/assets/utils/util';

@Component({
    components: { 'history-control': Control }
})
export default class History extends mixins(MapMixin) {
    public date: Date[] | null = null; // 选择的时间范围
    public path: HistoryPath[] | null = null; // 路径数据

    private index: { [x: string]: number } = {}; // 下一个数据点的索引
    private prevIndex: { [x: string]: number } = {}; // 上一次执行progress时的index
    private worker: WorkerObj = this.$worker.create();

    private get timeRange() {
        if (!this.date || this.date.length < 2) {
            return 0;
        }

        return this.date[1].getTime() - this.date[0].getTime();
    }

    public created() {
        this.worker.register({
            message: 'calcPosition',
            func: (
                pointsData: PositionItem[],
                targetTime: number,
                startTime: number
            ) => {
                const i: number = pointsData.findIndex(
                    p => p.time - startTime >= targetTime
                );

                let x: number = 0;
                let y: number = 0;
                if (i > -1) {
                    const point1 = pointsData[i];
                    const point0 = pointsData[i - 1] || { x: 0, y: 0, z: 0 };

                    const ratio: number =
                        point0.time != null
                            ? (targetTime - point0.time + pointsData[0].time) /
                              (point1.time - point0.time)
                            : 1;

                    x = (point1.x - point0.x) * ratio + point0.x;
                    y = (point1.y - point0.y) * ratio + point0.y;
                }

                return { x, y, i };
            }
        });
    }

    public destroyed() {
        Reflect.set(this, 'worker', null);
    }
    // 开始播放
    public play(progress: number) {
        if (this.path && this.mgr && this.date && this.date.length >= 2) {
            this.mgr.remove();
            this.prevIndex = {};

            const targetTime: number = (this.timeRange * progress) / 100;
            for (const v of this.path) {
                this.worker
                    .postMessage('calcPosition', [
                        v.position,
                        targetTime,
                        this.date[0].getTime()
                    ])
                    .then(({ x, y, i }) => {
                        if (i > 0) {
                            this.start(x, y, i, v);
                        }
                    })
                    .catch(console.error);
            }
        }
    }
    // 播放中
    public progress(progress: number) {
        if (this.mgr && this.path) {
            for (const v of this.path) {
                const i = this.index[v.id] || 0;
                const target = v.position[i];
                const prev = v.position[i - 1];

                if (!prev) {
                    if (!this.date || this.date.length < 2) {
                        return;
                    }

                    const playTime = (this.timeRange * progress) / 100;
                    const startTime = target.time - this.date[0].getTime();

                    if (playTime < startTime) {
                        return;
                    }

                    this.start(target.x, target.y, i, v);
                } else if (target && this.prevIndex[v.id] !== i) {
                    this.mgr.moveTo(
                        v.id,
                        {
                            x: target.x,
                            y: target.y
                        },
                        (target.time - prev.time) / 1000,
                        undefined,
                        () => this.index[v.id]++
                    );

                    this.prevIndex[v.id] = i;
                } else if (!target) {
                    this.mgr.remove(v.id);
                }
            }
        }
    }

    // 暂停
    public pause() {
        if (this.mgr) {
            this.mgr.stopMoveTo();
        }
    }

    // 切换路径显示状态
    public switchVisible(visible: boolean) {
        if (this.path && this.mgr) {
            if (visible) {
                for (const v of this.path) {
                    const points = [v.position[0]];
                    for (let i = 1; i < v.position.length - 1; i += 100) {
                        points.push(v.position[i]);
                    }
                    this.mgr.addLine(
                        points,
                        {
                            lineType: fengmap.FMLineType.FULL,
                            lineWidth: 2
                        },
                        v.id
                    );
                }
            } else {
                this.mgr.removeLine();
            }
        }
    }

    private start(x: number, y: number, i: number, pathItem: HistoryPath) {
        if (this.mgr) {
            this.mgr.addImage(
                {
                    x,
                    y,
                    height: 0.5,
                    url: pathItem.icon,
                    size: 48
                },
                pathItem.id,
                undefined,
                false
            );

            this.index[pathItem.id] = i + 1;
        }
    }
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
</style>
