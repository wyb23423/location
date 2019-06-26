<template>
    <div :class="$style.box">
        <div :class="$style['tool-bar']">
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
            ></map-select>
        </div>
        <div ref="map" style="height: 100%; overflow: hidden"></div>
    </div>
</template>

<script lang="ts" src="./monitor.ts">
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
