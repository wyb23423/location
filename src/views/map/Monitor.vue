<template>
    <div :class="$style.box" @click="hiddenCover">
        <div :class="$style['tool-bar']" class="flex-center">
            <map-select @selectmap="selectMap"></map-select>
            <el-input
                placeholder="请输入标签号"
                type="search"
                v-model="findTarget"
                style="width: 200px"
            >
                <el-button
                    slot="append"
                    icon="el-icon-search"
                    @click="find"
                ></el-button>
            </el-input>
        </div>
        <el-switch
            v-model="showPath"
            active-text="显示轨迹"
            inactive-text="隐藏轨迹"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :class="$style.switch"
        ></el-switch>

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
    padding: 0 5%;
    background: #fcf8e3;
    justify-content: space-between;
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
.switch {
    position: absolute;
    right: 20px;
    top: 70px;
}
</style>
