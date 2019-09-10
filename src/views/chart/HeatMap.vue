<template>
    <div class="map-box">
        <div
            class="map-tool-bar flex-center"
            style="justify-content: flex-start"
        >
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
            ></map-select>
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

@Component
export default class HeatMap extends mixins(MapMixin) {
    private heatMap!: FMHeatMap | PXHeatMap;

    protected bindEvents() {
        this.mgr!.on('loadComplete', () => {
            this.tagAnchor();

            this.heatMap = createHeatMap(this.mgr!);
            console.log(this.heatMap);
        });
    }
}
</script>

<style lang="postcss" module>
</style>