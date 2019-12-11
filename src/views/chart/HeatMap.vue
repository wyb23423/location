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
import { GET_INSTANT } from '@/constant/request';

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

        const {
            pagedData: { datas }
        }: ResponseData<ITagInfo> = await this.$http.get({
            url: GET_INSTANT,
            data: {
                time: this.date,
                mapId: this.mapId
            }
        });

        if (!datas.length) {
            return this.$message.info('没有历史数据');
        }

        const { mgr, heatMap } = this;
        datas.forEach(v => {
            const { x, y } = mgr!.getCoordinate(
                {
                    x: +v.position[0],
                    y: +v.position[1]
                },
                true
            );

            heatMap.addPoint(x, y, 100);
        });
        heatMap.render(mgr!);
    }

    public download() {
        if (this.container) {
            const canvas = this.container.children[0];
            if (canvas instanceof HTMLCanvasElement) {
                this.heatMap.download(
                    canvas,
                    `heatmap_${this.date ? this.date.toJSON() : 'unknown'}.png`
                );
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