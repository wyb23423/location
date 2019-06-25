<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[{ type: 'primary', name: 'setting', desc: '配置校准值' }]"
                :noPrint="true"
                @setting="setting"
                @updateData="getData"
            ></app-table>
        </el-card>

        <template v-if="!!bases">
            <setting
                :visible="!!bases"
                :bases="bases"
                @close="bases = null"
            ></setting>
        </template>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import TableMixin from '../../mixins/table';
import CalibrationSetting from '../../components/base/CalibrationSetting.vue';
import * as http from '../../assets/utils/http';

@Component({
    components: {
        setting: CalibrationSetting
    }
})
export default class Calibration extends mixins(TableMixin) {
    public colCfg: any[] = [
        { prop: 'id', label: '分组id', sortable: true },
        { prop: 'code', label: '分组编号' },
        { prop: 'count', label: '基站数量' }
    ];

    public bases: any = null;

    private allBase: any[] = [];

    public setting(row: any) {
        this.bases = row.children;
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            if (!this.allBase.length) {
                const res = await this.$http.get('/api/base/getall', {
                    pageSize: 10000000,
                    currentPage: 1
                });

                this.allBase = res.pagedData.datas;
            }

            const bases = this.toTree();

            count = bases.length;
            data = bases.slice((page - 1) * pageSize, page * pageSize);
        } catch (e) {
            //
        }

        return { count, data };
    }

    private toTree() {
        const group: { [key: string]: any[] } = {};
        this.allBase.forEach((v: any) => {
            (group[v.groupCode] || (group[v.groupCode] = [])).push(v);
        });

        return Object.entries(group)
            .sort((a, b) => +a[0] - +b[0])
            .map(([k, v], i) => ({
                id: i,
                count: v.length,
                code: k,
                children: v
            }));
    }
}
</script>

