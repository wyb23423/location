<template>
    <el-select
        v-model="value"
        placeholder="请选择地图"
        filterable
        default-first-option
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
import { Emit } from 'vue-property-decorator';

@Component
export default class MapSelect extends Vue {
    public value: number = 0;
    public options: IMap[] = [];

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
        const data: IMap = {
            id: 1,
            groupCode: '001',
            name: '办公室',
            filepath: '\\image\\huijinguangchang.fmap', // '/images/5ad8909aeff13.png', //
            margin: [
                [11582810.7716, 3575751.7814],
                [11582810.7716, 3575775.267],
                [11582841.6422, 3575775.267],
                [11582841.6422, 3575751.7814],
                [3073, 2326]
            ]
        };

        this.options.push(data);

        if (this.options.length) {
            this.value = this.options[0].id;
            this.$emit('selectmap', { ...this.options[0] });
        }
    }
}
</script>
