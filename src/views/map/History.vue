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
            @play="play"
            @progress="progress"
            @pause="pause"
            @path="switchVisible"
        ></history-control>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import MapMixin from '@/mixins/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import Control from '@/components/Control.vue';
import { WorkerObj } from '@/vue';

@Component({
    components: { 'history-control': Control }
})
export default class History extends mixins(MapMixin) {
    private path: any[][] = []; // 路径数据 [id, [[x, y, z, time], ...], icon]
    private index: { [x: string]: number } = {}; // 下一个数据点的索引
    private prevIndex: { [x: string]: number } = {}; // 上一次执行progress时的index

    private worker: WorkerObj = this.$worker.create();

    public created() {
        this.worker.register({
            message: 'calcPosition',
            func: (pointsData: number[][], targetTime: number) => {
                let i: number = pointsData.findIndex(
                    (p: number[]) => p[3] - pointsData[0][3] >= targetTime
                );

                let x: number = 0;
                let y: number = 0;
                if (i > -1) {
                    const point1: number[] = pointsData[i];
                    const point0: number[] = pointsData[i - 1] || [0, 0, 0];

                    const ratio: number =
                        point0[3] != null
                            ? (targetTime - point0[3] + pointsData[0][3]) /
                              (point1[3] - point0[3])
                            : 1;

                    x = (point1[0] - point0[0]) * ratio + +point0[0];
                    y = (point1[1] - point0[1]) * ratio + +point0[1];
                } else {
                    i = pointsData.length - 1;
                    x = +pointsData[i][0];
                    y = +pointsData[i][1];
                }

                return { x, y, i };
            }
        });
    }

    public destroyed() {
        Reflect.set(this, 'worker', null);
    }

    // 开始播放
    public play(progress: number, timeRange: number, path: any[][]) {
        this.path = path || this.path;

        if (this.path && this.mgr) {
            this.mgr.remove();
            this.prevIndex = {};

            const targetTime: number = (timeRange * progress) / 100;
            for (const v of this.path) {
                this.worker
                    .postMessage('calcPosition', [v[1], targetTime])
                    .then(({ x, y, i }) => {
                        if (this.mgr) {
                            this.mgr.addImage(
                                {
                                    x,
                                    y,
                                    height: 0.5,
                                    url: v[2],
                                    size: 48
                                },
                                v[0],
                                undefined,
                                false
                            );
                        }

                        this.index[v[0]] = i + 1;
                    })
                    .catch(console.error);
            }
        }
    }

    // 播放中
    public progress() {
        if (this.mgr) {
            for (const v of this.path) {
                const i = this.index[v[0]] || 0;
                const target = v[1][i];
                const prev = v[1][i - 1];

                if (target && prev && this.prevIndex[v[0]] !== i) {
                    this.mgr.moveTo(
                        v[0],
                        {
                            x: +target[0],
                            y: +target[1]
                        },
                        (target[3] - prev[3]) / 1000,
                        undefined,
                        () => this.index[v[0]]++
                    );

                    this.prevIndex[v[0]] = i;
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
    public switchVisible() {
        //
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
