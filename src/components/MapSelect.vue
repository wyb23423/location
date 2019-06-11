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
import Vue from 'vue';
import Component from 'vue-class-component';
import Router from 'vue-router';
import { State } from 'vuex-class/lib/bindings';
import { Emit } from 'vue-property-decorator';

export interface MapData {
    id: number;
    name: string;
    filepath: string;
    margin: Array<[number, number]>;
}

@Component
export default class MapSelect extends Vue {
    @State public baseUrl!: string;

    public value: number = 0;
    public options: MapData[] = [];

    public created() {
        this._getMapData();
    }

    @Emit()
    public selectmap(id: number) {
        return this.options.find(v => v.id === id);
    }

    private _getMapData() {
        // 模拟数据
        // TODO
        const data: MapData = {
            id: 1,
            name: '办公室',
            filepath: '\\image\\huijinguangchang.fengmap',
            margin: [[0, 0], [0, 2800], [3000, 2800], [3000, 0]]
        };

        this.options.push(data);

        this.value = this.options[0].id;
        this.$emit('selectmap', this.value);
    }
}
</script>

<style lang="postcss" module>
</style>