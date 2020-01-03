<template>
    <div @click.stop>
        <el-card class="card" ref="table" :class="$style.box">
            <app-table
                :max-height="500"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[{ type: 'danger', name: 'switch', desc: '切换显示' }]"
                ,
                :op-width="100"
                @switch="switchZone"
                @updateData="getData"
                :isSmall="true"
                :noPrint="true"
            ></app-table>
        </el-card>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin, { ColCfgItem } from '../../mixins/table';
import { Prop } from 'vue-property-decorator';
import { FengMapMgr } from '../../assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';

@Component
export default class Group extends mixins(TableMixin) {
    @Prop() public group!: { [x: string]: IBaseStation[] };

    public colCfg: ColCfgItem[] = [
        { prop: 'id', label: '分组', width: 100 },
        { prop: 'bases', label: '基站', width: 200 }
    ];

    public switchZone(row: { id: string; children: IBaseStation[] }) {
        if (this.$parent) {
            const mgr: FengMapMgr | PIXIMgr = Reflect.get(this.$parent, 'mgr');
            if (mgr) {
                row.children.forEach(v => mgr.show(v.id));
            }
        }
    }

    protected async fetch(page: number, pageSize: number) {
        const list = Object.entries(this.group).slice(
            (page - 1) * pageSize,
            page * pageSize
        );

        return {
            count: list.length,
            data: list.map(v => ({
                id: v[0],
                bases: v[1].map(b => b.id).join(','),
                children: v[1]
            }))
        };
    }
}
</script>

<style lang="postcss" module>
.box {
    width: 40%;
    height: auto;
    position: absolute;
    left: 200px;
    bottom: 50px;
}
</style>


