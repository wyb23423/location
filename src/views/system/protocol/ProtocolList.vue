<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[{ type: 'danger', name: 'del', desc: '删除' }]"
                :op-width="200"
                :isSmall="true"
                @del="del"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Table from '../../../components/Table.vue';
import TableMixin from '../../../mixins/table';
import * as http from '../../../assets/utils/http';

@Component({
    components: {
        'app-table': Table
    }
})
export default class ProtocolList extends mixins(TableMixin) {
    public colCfg: any[] = [
        { prop: 'id', label: 'ID', sortable: true, width: 220 },
        { prop: 'name', label: '协议名称', width: 220 },
        { prop: 'port', label: '协议端口号', width: 220 },
        { prop: 'effect', label: '协议作用', width: 220 },
        { prop: 'content', label: '协议内容', width: 220 }
    ];

    public del(row: any) {
        console.log(row);
    }

    public async _getData(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await http.get('/api/protocol/getall', {
                pageSize: Number.MAX_VALUE,
                currentPage: 1
            });

            data = res.pagedData.datas;
            count = res.pagedData.totalCount || data.length;
        } catch (e) {
            //
        }

        return { count, data };
    }
}
</script>
