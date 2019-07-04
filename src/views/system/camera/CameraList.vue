<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[{ type: 'danger', name: 'del', desc: '删除' }]"
                :op-width="120"
                @del="del"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import TableMixin from '../../../mixins/table';

@Component
export default class CameraList extends mixins(TableMixin) {
    @State public baseUrl!: string;

    public colCfg: any[] = [
        { prop: 'id', label: '摄像头ID', sortable: true, width: 140 },
        { prop: 'ip', label: '摄像头IP', width: 260 },
        { prop: 'port', label: '设备端口号', width: 200 },
        { prop: 'groupCode', label: '所属组号', sortable: true, width: 200 },
        { prop: 'username', label: '用户名', width: 220 },
        { prop: 'windowSplit', label: '窗口分割数', width: 140 }
    ];

    public del(row: any) {
        this.$confirm(`删除摄像头${row.id}?`)
            .then(() =>
                this.$http.post('/api/camera/deleteCamera', { id: row.id })
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
            const res = await this.$http.get('/api/camera/getall', {
                pageSize,
                currentPage: page
            });

            data = res.pagedData.datas;
            count = res.pagedData.totalCount;
        } catch (e) {
            console.log(e);
        }

        return { count, data };
    }
}
</script>

