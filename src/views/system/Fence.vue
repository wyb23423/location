<template>
    <div style="position: relative; padding-left: 5%">
        <div :class="$style['tool-bar']">
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
            ></map-select>
        </div>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import MapSelect, { MapData } from '../../components/MapSelect.vue';
import Vue from 'vue';

@Component({
    components: {
        'map-select': MapSelect
    }
})
export default class Fence extends Vue {
    public selectMap(data: MapData) {
        console.log(data);
    }
}
</script>

<style lang="postcss" module>
:root {
    --fixed: {
        position: absolute;
        top: 0;
        left: 0;
    }
}

.tool-bar {
    @apply --fixed;

    width: 100%;
    height: 60px;
    background: #fcf8e3;
    display: flex;
    align-items: center;
}
</style>
