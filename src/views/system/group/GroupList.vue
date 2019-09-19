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
                @del="del"
                @setting="group = $event"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '@/mixins/table';

@Component
export default class GroupList extends mixins(TableMixin) {
    public group: Record<string, any> | null = null;

    public get op() {
        return [
            { type: 'danger', name: 'del', desc: '删除' },
            { type: 'primary', name: 'setting', desc: '编辑' }
        ];
    }

    public del() {
        //
    }

    protected async fetch(page: number, pageSize: number) {
        const data: IGroup[] = [];
        for (let i = 0; i < pageSize; i++) {
            // data.push({
            //     id: i,
            // })
        }

        return { count: pageSize, data };
    }
}
</script>