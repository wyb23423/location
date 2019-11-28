<template>
    <app-page :tabs="tabs" :hasRouter="false">
        <div style="padding: 5%; height: 100%">
            <el-card class="card" ref="table">
                <app-table
                    :max-height="maxHeight"
                    :table-data="tableData"
                    :col-cfg="colCfg"
                    :total-count="totalCount"
                    :op="op"
                    :op-width="120"
                    @del="del"
                    @updateData="getData"
                    @toExcel="toExcel"
                >
                    <el-button
                        size="mini"
                        :disabled="!tableData.length"
                        @click="delPage"
                    >
                        删除本页
                    </el-button>
                </app-table>
            </el-card>
        </div>
    </app-page>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import Page from '@/components/layout/Page.vue';
import { Async } from '../../assets/utils/util';

@Component({
    components: {
        'app-page': Page
    }
})
export default class Alarm extends mixins(TableMixin) {
    public type = '';
    public tabs = [
        {
            title: '报警列表',
            to: '/alarm',
            icon: 'el-icon-alarm-clock'
        }
    ];
    public colCfg: any[] = [
        { prop: 'id', label: '报警ID', sortable: true, width: 140 },
        { prop: 'deviceId', label: '设备编号', width: 160 },
        { prop: 'type', label: '报警类型', sortable: true, width: 140 },
        {
            prop: 'time',
            label: '时间',
            width: 200,
            formatter: (<any>this.$options.filters).date
        },
        { prop: 'content', label: '报警信息', width: 240 }
    ];

    @Async()
    public async del(row: IAlarm) {
        await this.$confirm(`删除报警信息${row.id}?`);
        await this.$http.post('/api/alarm/deleteAlarm', { id: row.id });
        this.refresh().$message.success('删除成功');
    }

    @Async()
    public async delPage() {
        await this.$confirm('删除本页所有报警信息?');

        const ids = this.tableData.map((v: IAlarm) => v.id);
        // TODO: 向服务器发送批量删除的请求

        const maxPage = Math.ceil(this.totalCount / this.pageSize) - 1;
        this.refresh(true, Math.min(this.page, maxPage)).$message.success(
            '删除成功'
        );
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get('/api/alarm/getall', {
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