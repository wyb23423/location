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

@Component({
    components: { 'history-control': Control }
})
export default class History extends mixins(MapMixin) {
    private path: any[][] = [];
    private i: number = 1;
    private isStart: boolean = false;

    // 从0开始播放
    public play(path: any[][]) {
        this.i = 1;
        this.path = path;
        this.isStart = true;

        if (this.mgr) {
            this.mgr.remove();
            for (const v of path) {
                this.mgr.addImage(
                    {
                        x: +v[1][0][0],
                        y: +v[1][0][1],
                        height: 0.5,
                        url: v[2],
                        size: 48
                    },
                    v[0],
                    undefined,
                    false
                );
            }
        }
    }

    // 播放中
    public progress() {
        if (this.isStart) {
            const path = this.path.map(v => {
                const target = v[1][this.i];
                const prev = v[1][this.i - 1];
                if (target && prev) {
                    return {
                        id: v[0],
                        coord: {
                            x: +target[0],
                            y: +target[1]
                        },
                        time: target[3] - prev[3]
                    };
                }

                return null;
            });

            if (this.mgr) {
                for (const v of path) {
                    if (v) {
                        this.mgr.moveTo(
                            v.id,
                            v.coord,
                            v.time / 1000,
                            undefined,
                            () => {
                                this.isStart = true;
                                this.i++;
                            }
                        );
                    }
                }
            }

            this.isStart = false;
        }
    }

    // 暂停
    public pause() {
        //
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
