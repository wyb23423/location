<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="op"
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
import TableMixin from '../../../mixins/table';

@Component
export default class ProtocolList extends mixins(TableMixin) {
    public colCfg: any[] = [
        { prop: 'id', label: 'ID', sortable: true, width: 220 },
        { prop: 'name', label: '协议名称', width: 220 },
        { prop: 'port', label: '协议端口号', width: 220 },
        { prop: 'effect', label: '协议作用', width: 220 },
        { prop: 'content', label: '协议内容', width: 220 }
    ];

    public del(row: any) {
        this.$confirm(`删除协议${row.id}?`)
            .then(() =>
                this.$http.post('/api/protocol/deleteProtocol', { id: row.id })
            )
            .then(() => {
                this.$message.success('删除成功');
                this.refresh();
            })
            .catch(console.log);
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get('/api/protocol/getall', {
                pageSize: 10_0000,
                currentPage: 1
            });

            data = res.pagedData.datas;
            count = res.pagedData.totalCount || data.length;
        } catch (e) {
            console.log(e);
        }

        return { count, data };
    }
}
</script>
