<template>
    <div @click.stop>
        <el-card class="card" ref="table" :class="$style.box">
            <app-table
                :max-height="500"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[{ type: 'danger', name: 'switch', desc: '切换显示' }]"
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
import TableMixin from '../../mixins/table';
import { Prop } from 'vue-property-decorator';
import { FengMapMgr } from '../../assets/map/fengmap';

const openZone: Set<string> = new Set(); // 已显示的区域

@Component
export default class Zone extends mixins(TableMixin) {
    @Prop() public zones!: IZone[];

    public colCfg: any[] = [
        { prop: 'name', label: '区域' },
        { prop: 'status', label: '状态' }
    ];

    public switchZone(row: IZone) {
        if (this.$parent) {
            const mgr: FengMapMgr = Reflect.get(this.$parent, 'mgr');
            if (mgr) {
                if (openZone.has(row.name)) {
                    mgr.remove(row.name);
                    openZone.delete(row.name);
                } else {
                    mgr.zoneOpen(row);
                    openZone.add(row.name);
                }
            }
        }
    }

    protected async fetch(page: number, pageSize: number) {
        const list = this.zones.slice((page - 1) * pageSize, page * pageSize);

        return {
            count: this.zones.length,
            data: list.map(v => {
                const tmp: IZone = { ...v };
                tmp.status = v.enable ? '开启' : '关闭';
                tmp.position =
                    typeof v.position === 'string'
                        ? JSON.parse(v.position)
                        : v.position;

                return tmp;
            })
        };
    }
}
</script>

<style lang="postcss" module>
.box {
    width: 500px;
    height: auto;
    position: absolute;
    left: 220px;
    bottom: 50px;
}
</style>


