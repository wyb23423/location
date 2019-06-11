<template>
    <el-select
        v-model="value"
        placeholder="请选择地图"
        filterable
        @change="selectmap"
    >
        <el-option
            v-for="item of options"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        >
        </el-option>
    </el-select>
</template>

<script lang="ts">
/// <reference path="../../types/fengmap.d.ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import Router from 'vue-router';
import { State } from 'vuex-class/lib/bindings';
import { Emit } from 'vue-property-decorator';
import { MapData } from '../assets/utils/map';

@Component
export default class MapSelect extends Vue {
    @State public baseUrl!: string;

    public value: number = 0;
    public options: MapData[] = [];

    public mounted() {
        this._getMapData();
    }

    @Emit()
    public selectmap(id: number) {
        const map = this.options.find(v => v.id === id);

        if (map) {
            return { ...map };
        } else {
            console.warn(`没找到id为${id}的地图数据`);

            return null;
        }
    }

    private _getMapData() {
        // 模拟数据
        // TODO
        const data: MapData = {
            id: 1,
            name: '办公室',
            filepath: '\\image\\huijinguangchang.fmap',
            margin: [[0, 0], [0, 2800], [3000, 2800], [3000, 0]]
        };

        this.options.push(data);

        this.value = this.options[0].id;
        this.$emit('selectmap', { ...this.options[0] });
    }
}
</script>

<style lang="postcss" module>
</style>