<template>
    <div :class="$style.box" @click="hiddenCover">
        <div :class="$style['tool-bar']">
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
            ></map-select>
        </div>
        <div ref="map" style="height: 100%; overflow: hidden"></div>
        <div :class="$style.tools">
            <el-button
                v-for="(v, i) of tools"
                :key="i"
                :type="v.active ? 'primary' : ''"
                :class="$style['tool-item']"
                @click.stop="swithDisplay(i)"
                v-show="v.display"
            >
                {{ v.name }}
            </el-button>
        </div>

        <transition name="el-zoom-in-bottom">
            <Census
                v-if="tools[4].active"
                @close="tools[4].active = false"
                :tags="tagAll"
                :zones="zoneAll"
                :renderTags="renderTags"
            ></Census>
        </transition>

        <transition name="el-fade-in-linear">
            <Group :group="group" v-if="tools[3].active"></Group>
            <Zone :zones="zoneAll" v-if="tools[2].active"></Zone>
        </transition>
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
.tools {
    position: absolute;
    left: 50px;
    bottom: 50px;
    width: 140px;
    border-radius: 10px;
    /* border: 1px solid #ccc; */
    overflow: hidden;
}
.tool-item {
    width: 100%;
    margin: 0 !important;
    border-radius: 0 !important;
    display: block;
}
</style>
