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

        <template v-if="!!group">
            <el-dialog
                title="更改分组信息"
                :visible="true"
                :modal-append-to-body="false"
                width="80%"
                @close="group = null"
            >
                <group-add
                    :form="group"
                    :show-id="false"
                    style="padding: 0"
                ></group-add>
            </el-dialog>
        </template>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '@/mixins/table';
import GroupAdd from './GroupAdd.vue';

@Component({
    components: {
        'group-add': GroupAdd
    }
})
export default class GroupList extends mixins(TableMixin) {
    public group: Record<string, any> | null = null;
    public colCfg = [
        { prop: 'id', label: '组号', width: 140 },
        { prop: 'min', label: '最小基站数', width: 140 },
        { prop: 'size', label: '最大基站数', width: 140 },
        { prop: 'description', label: '描述', width: 260 }
    ];

    public get op() {
        return [
            { type: 'danger', name: 'del', desc: '删除' },
            { type: 'primary', name: 'setting', desc: '编辑' }
        ];
    }

    public del(row: IGroup) {
        this.$confirm(`删除分组${row.id}`)
            .then(() => console.log(row))
            .catch(console.log);
    }

    protected async fetch(page: number, pageSize: number) {
        const data: IGroup[] = [];
        for (let i = 0; i < pageSize; i++) {
            data.push({
                id: i + '',
                size: 7,
                min: 4,
                algorithmType: 11,
                description: 'this is description'
            });
        }

        return { count: pageSize, data };
    }
}
</script>