<template>
    <div class="map-box">
        <div class="map-tool-bar flex-center" :class="$style['tool-bar']">
            <map-select @selectmap="selectMap"></map-select>
            <div>
                <el-date-picker
                    v-model="date"
                    type="datetime"
                    placeholder="选择日期时间"
                    @change="paint"
                >
                </el-date-picker>
                <el-button
                    icon="el-icon-download"
                    :disabled="!date"
                    style="margin-left: 10px"
                    @click="download"
                ></el-button>
            </div>
        </div>
        <div ref="map" style="height: 100%; overflow: hidden"></div>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import MapMixin from '../../mixins/map';
import FMHeatMap from '@/assets/map/fengmap/heat_map';
import PXHeatMap from '@/assets/map/pixi/heat_map';
import { createHeatMap } from '@/assets/map';
import { download } from '@/assets/utils/download';

@Component
export default class HeatMap extends mixins(MapMixin) {
    public date: Date | null = null;

    private heatMap!: FMHeatMap | PXHeatMap;

    public paint() {
        if (!this.date) {
            return this.mgr && this.heatMap.remove(this.mgr);
        }

        this.heatMap.clearPoints();
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
            const canvas = this.container.children[0];
            if (canvas instanceof HTMLCanvasElement) {
                const name = `heatmap_${
                    this.date ? this.date.toJSON() : 'unknown'
                }.png`;
                canvas.toBlob(blob => blob && download(blob, name));
            }
        }
    }

    protected bindEvents() {
        this.mgr!.on('loadComplete', () => {
            this.tagAnchor();

            this.heatMap = createHeatMap(this.mgr!);
        });
    }
}
</script>

<style lang="postcss" module>
.tool-bar {
    justify-content: space-between;
    padding: 0 5%;
}
</style>