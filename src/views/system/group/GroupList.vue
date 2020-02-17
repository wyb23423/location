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
import { RM_GROUP, GET_GROUP } from '@/constant/request';
import { Async } from '@/assets/utils/util';

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
        { prop: 'description', label: '描述', width: 260 },
        { prop: 'mapName', label: '所属地图', width: 140 }
    ];

    public get op() {
        const btn = [];
        if (this.permission?.delete) {
            btn.push({ type: 'danger', name: 'del', desc: '删除' });
        }

        if (this.permission?.post) {
            btn.push({ type: 'primary', name: 'setting', desc: '编辑' });
        }

        return btn;
    }

    @Async()
    public async del(row: IGroup) {
        await this.$confirm(`删除分组${row.id}`);
        await this.$http.post(RM_GROUP, { groupCode: row.id });
        this.refresh().$message.success('删除成功');
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get(GET_GROUP, {
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