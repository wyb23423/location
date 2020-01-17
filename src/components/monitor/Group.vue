<template>
    <div @click.stop>
        <el-card class="card" ref="table" :class="$style.box">
            <app-table
                :max-height="500"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="groupOp"
                :op-width="90"
                @display="displayBase"
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
import { TableRowOperation } from '../Table.vue';
import DisplayMixin from '@/mixins/zone/display';

@Component
export default class Group extends mixins(TableMixin, DisplayMixin) {
    @Prop() public group!: { [x: string]: IBaseStation[] };
    @Prop() public groupOp!: TableRowOperation[];

    public colCfg: ColCfgItem[] = [
        { prop: 'id', label: '分组', width: 70 },
        { prop: 'bases', label: '基站', width: 200 }
    ];

    protected switchDesc = '显示';

    public getOperation() {
        return this.groupOp || [];
    }

    public displayBase(row: { id: string; children: IBaseStation[] }) {
        if (this.$parent) {
            const mgr: FengMapMgr | PIXIMgr = Reflect.get(this.$parent, 'mgr');
            if (mgr) {
                row.children.forEach(v => mgr.show(v.id));
                this.display(row, 0, false);
            }
        }
    }

    // ===================================重写DisplayMixin的方法为什么都不做
    protected remove(row: any) {
        //
    }
    protected show(row: any) {
        //
    }
    // ==================================

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


