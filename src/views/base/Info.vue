<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[
                    { type: 'success', name: 'look', desc: '查看详情' },
                    { type: 'danger', name: 'del', desc: '删除' }
                ]"
                :op-width="200"
                @del="del"
                @look="look"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Table from '../../components/Table.vue';
import TableMixin from '../../mixins/table';
import * as http from '../../assets/utils/http';

@Component({
    components: {
        'app-table': Table
    }
})
export default class Info extends mixins(TableMixin) {
    public colCfg: any[] = [
        { prop: 'id', label: '基站ID', sortable: true, width: 150 },
        { prop: 'baseNo', label: '基站编号', width: 175 },
        { prop: 'name', label: '基站名称', width: 175 },
        { prop: 'main', label: '主基站', width: 145 },
        { prop: 'zone', label: '基站区域', width: 170 },
        { prop: 'ip', label: '基站IP', width: 210 }
    ];

    public del(row: any) {
        console.log(row);
    }

    public look(row: any) {
        console.log(row);
    }

    public async _getData(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await http.get('/api/base/getall', {
                pageSize,
                currentPage: page
            });
            data = res.pagedData.datas;
            count = res.pagedData.totalCount;
        } catch (e) {
            //
        }

        return { count, data };
    }
}
</script>

