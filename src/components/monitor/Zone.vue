<template>
    <div @click.stop>
        <el-card class="card" ref="table" :class="$style.box">
            <el-select
                multiple
                v-model="modes"
                style="margin-bottom: 10px"
                placeholder="区域类型"
                size="mini"
                @change="getData(1, pageSize)"
            >
                <el-option
                    v-for="(v, i) of modeDescript"
                    :key="v"
                    :label="v"
                    :value="i"
                    v-show="Object.values(zoneMode).includes(i)"
                ></el-option>
            </el-select>
            <app-table
                :max-height="500"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="zoneOp"
                @display="display"
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
import { State } from 'vuex-class/lib/bindings';
import { ZoneMode } from '@/store';
import DisplayMixin from '../../mixins/zone/display';

@Component
export default class Zone extends mixins(TableMixin, DisplayMixin) {
    @State public readonly zoneMode!: ZoneMode;
    @State public readonly modeDescript!: string[];

    @Prop() public readonly zones!: IZone[];
    @Prop() public readonly zoneOp!: any[];

    public modes: number[] = [];

    public colCfg: any[] = [
        { prop: 'name', label: '区域' },
        { prop: 'status', label: '状态' }
    ];

    public get mgr() {
        return this.$parent && Reflect.get(this.$parent, 'mgr');
    }

    protected getOperation() {
        return this.zoneOp || [];
    }

    protected async fetch(page: number, pageSize: number) {
        let zones = this.zones;
        if (this.modes.length) {
            zones = this.zones.filter(v => this.modes.includes(v.mode));
        }
        const list = zones.slice((page - 1) * pageSize, page * pageSize);

        return {
            count: zones.length,
            data: list.map(v => {
                const tmp = <IZone & { status: string }>{ ...v };
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
    width: 60%;
    height: auto;
    position: absolute;
    left: 200px;
    bottom: 50px;
}
</style>


