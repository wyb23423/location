<template>
    <div>
        <div class="main">
            <div :style="{ height: mainHeight }" style="overflow-y: auto">
                <div style="padding: 5%; height: 100%">
                    <el-card class="card" ref="table">
                        <app-table
                            :max-height="maxHeight"
                            :table-data="tableData"
                            :col-cfg="colCfg"
                            :total-count="totalCount"
                            :op="[
                                { type: 'danger', name: 'del', desc: '删除' }
                            ]"
                            :op-width="120"
                            @del="del"
                            @updateData="getData"
                            @toExcel="toExcel"
                        ></app-table>
                    </el-card>
                </div>
            </div>
        </div>
        <app-aside :tabs="tabs"></app-aside>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Aside from '../../components/Aside.vue';
import { Getter } from 'vuex-class/lib/bindings';
import TableMixin from '../../mixins/table';

@Component({
    components: {
        'app-aside': Aside
    }
})
export default class Alarm extends mixins(TableMixin) {
    @Getter('mainHeight') public mainHeight!: string;

    public tabs = [
        {
            title: '报警列表',
            to: '/alarm',
            icon: 'el-icon-alarm-clock'
        }
    ];

    public colCfg: any[] = [
        { prop: 'id', label: '报警ID', sortable: true, width: 140 },
        { prop: 'tagNo', label: '报警标签', width: 160 },
        { prop: 'baseNo', label: '基站编号', width: 160 },
        { prop: 'type', label: '报警类型', width: 140 },
        { prop: 'alarmTime', label: '时间', width: 200 },
        { prop: 'alarmMsg', label: '报警信息', width: 240 }
    ];

    public del(row: any) {
        console.log(row);
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
            //
        }

        return { count, data };
    }
}
</script>