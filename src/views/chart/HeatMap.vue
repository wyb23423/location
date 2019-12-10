<template>
    <div class="map-box">
        <div class="map-tool-bar flex-center" :class="$style['tool-bar']">
            <map-select @selectmap="selectMap"></map-select>
            <div>
                <el-date-picker
                    v-model="date"
                    type="datetime"
                    placeholder="选择日期时间"
                >
                </el-date-picker>
                <el-button style="margin-left: 10px" @click="paint">
                    {{ date ? '绘制' : '清除' }}
                </el-button>
                <el-button
                    icon="el-icon-download"
                    :disabled="!date"
                    style="margin-left: 10px"
                    @click="download"
                ></el-button>
            </div>
        </div>
        <div
            ref="map"
            id="map-box"
            style="height: 100%; overflow: hidden"
        ></div>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import MapMixin from '../../mixins/map';
import FMHeatMap from '@/assets/map/fengmap/heat_map';
import PXHeatMap from '@/assets/map/pixi/heat_map';
import { createHeatMap } from '@/assets/map';
import { download } from '@/assets/utils/download';
import { randomNum, Async } from '../../assets/utils/util';
import { FengMapMgr } from '@/assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';

@Component
export default class HeatMap extends mixins(MapMixin) {
    public date: Date | null = null;

    private heatMap!: FMHeatMap | PXHeatMap;
    private oldDate?: Date | null;

    @Async()
    public async paint() {
        this.heatMap = this.heatMap || createHeatMap(<any>{});
        if (!this.beforePaint()) {
            return;
        }

        const { mgr, heatMap } = this;

        // for (let i = 0; i < 10; i++) {
        //     const { x, y } = mgr!.getCoordinate(
        //         {
        //             x: randomNum(200, 3000, false),
        //             y: randomNum(500, 2000, false)
        //         },
        //         true
        //     );

        //     heatMap.addPoint(x, y, 100);
        // }
        const { x: x0, y: y0 } = mgr!.getCoordinate(
            {
                x: 510,
                y: 2116
            },
            true
        );

        heatMap.addPoint(x0, y0, 100);
        heatMap.render(mgr!);

        // TODO 获取数据点并绘制

        // this.$http.post({
        //     url: '/api/tag/queryTagHistory',
        //     body: {
        //         startTime: this.date,
        //         endTime: this.date
        //     },
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // });
    }

    public download() {
        if (this.container) {
            const c = this.container.children[0];
            if (c instanceof HTMLCanvasElement) {
                const name = `heatmap_${
                    this.date ? this.date.toJSON() : 'unknown'
                }.png`;

                const canvas = document.createElement('canvas');
                canvas.width = c.width;
                canvas.height = c.height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(c, 0, 0);
                    this.heatMap.paint(ctx);
                    canvas.toBlob(blob => blob && download(blob, name));
                } else {
                    console.log('创建画布失败');
                }
            }
        }
    }

    protected initData() {
        this.oldDate = void 0;
    }
    protected bindEvents() {
        this.mgr!.on('loadComplete', () => {
            // this.mgr!.switchViewMode(fengmap.FMViewMode.MODE_3D);
            this.tagAnchor();

            this.heatMap = createHeatMap(this.mgr!);
        });
    }
    protected dispose() {
        this.mgr && this.heatMap.remove(this.mgr);
    }

    private beforePaint() {
        if (this.oldDate === this.date) {
            return false;
        }
        this.oldDate = this.date;

        if (!this.mgr) {
            return false;
        }

        if (!this.date) {
            this.heatMap.remove(this.mgr);
            return false;
        }

        this.heatMap.clearPoints();
        return true;
    }
}
</script>

<style lang="postcss" module>
.tool-bar {
    justify-content: space-between;
    padding: 0 5%;
    z-index: 9;
}
</style>