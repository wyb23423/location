<template>
    <app-page :tabs="tabs">
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
                    @selection-change="selected = $event"
                >
                    <el-table-column
                        slot="column"
                        type="selection"
                        width="40"
                    ></el-table-column>
                    <el-button
                        size="mini"
                        :disabled="!tableData.length"
                        @click="delMul"
                    >
                        删除选中
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
import { RM_ALARM, GET_ALARM, RM_ALARM_BATCH } from '@/constant/request';

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
    public selected: IAlarm[] = [];

    @Async()
    public async del(row: IAlarm) {
        await this.$confirm(`删除报警信息${row.id}?`);
        await this.$http.post(RM_ALARM, { id: row.id });
        this.refresh().$message.success('删除成功');
    }

    @Async()
    public async delMul() {
        const ids = this.selected.map(v => v.id);
        if (!ids.length) {
            return this.$message.warning('未选择报警信息!');
        }

        await this.$confirm('删除选中的所有报警信息?');

        await this.$http.request({
            url: RM_ALARM_BATCH,
            method: 'DELETE',
            data: { ids },
            headers: { 'Content-Type': 'application/json' }
        });

        const page =
            ids.length >= this.tableData.length ? this.page - 1 : this.page;
        this.refresh(true, page).$message.success('删除成功');
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get(GET_ALARM, {
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