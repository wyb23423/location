<template>
    <app-page :tabs="tabs" :hasRouter="false">
        <div style="padding: 5%; height: 100%">
            <el-card class="card" ref="table">
                <el-button type="mini" style="margin-bottom: 10px">
                    类型筛选
                </el-button>

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
                ></app-table>
            </el-card>
        </div>
    </app-page>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import Page from '@/components/layout/Page.vue';

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
        { prop: 'time', label: '时间', width: 200 },
        { prop: 'content', label: '报警信息', width: 240 }
    ];

    // TODO
    public alarms = [
        { value: 1, label: '非法侵入' },
        { value: 2, label: '非法逃离' },
        { value: 3, label: '低电量' }
    ];

    public del(row: IAlarm) {
        this.$confirm(`删除报警信息${row.id}?`)
            .then(() =>
                this.$http.post('/api/alarm/deleteAlarm', { id: row.id })
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