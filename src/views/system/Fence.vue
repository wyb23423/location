<template>
    <div :class="$style.box">
        <div :class="$style['tool-bar']">
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
            ></map-select>
        </div>
        <div ref="map" style="height: 100%; overflow: hidden"></div>
        <el-collapse v-model="activeNames" :class="$style.op">
            <el-collapse-item name="info" title="区域信息">
                <app-table
                    :max-height="maxHeight"
                    :tableData="tableData"
                    :colCfg="colCfg"
                    :totalCount="totalCount"
                    :op="op"
                    :noPrint="true"
                    :isSmall="true"
                    @updateData="getData"
                    @del="del"
                    @display="display"
                    :class="$style.table"
                ></app-table>
            </el-collapse-item>
            <el-collapse-item title="添加区域" name="add">
                <div>
                    控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；
                </div>
                <div>
                    页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import MapSelect from '../../components/MapSelect.vue';
import Vue from 'vue';
import { MapData, LocationMap } from '../../assets/utils/map';
import { loopAwait } from '../../assets/utils/util';
import TableMixin from '../../mixins/table';
import Table, { TableRowOperation } from '../../components/Table.vue';

@Component({
    components: {
        'map-select': MapSelect,
        'app-table': Table
    }
})
export default class Fence extends mixins(TableMixin) {
    public map?: LocationMap;

    public maxHeight: number = 255;
    public colCfg: any[] = [
        { prop: 'name', label: '区域', sortable: true, width: 120 },
        { prop: 'isOpen', label: '状态', width: 80 }
    ];
    public op: TableRowOperation[] = [
        { type: 'danger', name: 'del', desc: '删除' },
        {
            type: { default: 'primary' },
            name: 'display',
            desc: { default: '显示' }
        }
    ];

    public activeNames: string[] = ['info', 'add'];

    public del(row: any) {
        console.log(row);
    }
    public display(row: any, index: number) {
        console.log(row, index);

        const op: any = this.op[1];
        op.type[index] = op.type[index] ? undefined : 'success';
        op.desc[index] = op.desc[index] ? undefined : '隐藏';

        this.$set(this.op, 1, op);
    }

    public async selectMap(data: MapData) {
        if (data) {
            const dom = <HTMLElement>this.$refs.map;
            await loopAwait(() => !!dom.offsetWidth && !!dom.offsetHeight);

            this.map = new LocationMap(data, dom);
        }
    }

    public async _getData(page: number, pageSize: number) {
        // TODO: 换为请求
        // 模拟数据
        return {
            count: 40,
            data: [
                {
                    isOpen: '开启',
                    id: 26,
                    name: '全部区域',
                    position: [
                        { x: -0.9095089685816896, y: 1849.9453632454365 },
                        { x: -38.21209882974026, y: 104.85372044282641 },
                        { x: 2413.5853957760114, y: 78.69602985429896 },
                        { x: 2396.6296731272414, y: 1763.998665644061 },
                        { x: 2227.0724466395422, y: 1861.155802069091 }
                    ]
                },
                {
                    isOpen: '关闭',
                    id: 25,
                    name: 'C',
                    position: [
                        { x: 710.5247554581757, y: 1809.3815817503148 },
                        { x: 693.6882925245968, y: 792.5563051437117 },
                        { x: 1437.8599577445877, y: 766.5790170557325 },
                        { x: 1471.5328837810696, y: 1842.7809521424817 }
                    ]
                }
            ]
        };
    }
}
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
.op {
    position: absolute;
    top: 0;
    right: 0;
    width: 25%;

    & div[role='button'] {
        background: #f2f2f2;
        padding-left: 10px;
        border-bottom: 1px solid #ccc;
    }

    & div[role='tabpanel'] {
        padding: 10px;
    }
}
</style>
