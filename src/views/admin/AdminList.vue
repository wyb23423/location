<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :tableData="tableData"
                :colCfg="colCfg"
                :totalCount="totalCount"
                :op="[{ type: 'danger', name: 'del', desc: '删除' }]"
                @del="del"
                @updateData="getData"
                :class="$style.table"
                @toExcel="toExcel"
            ></app-table>
        </el-card>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import Table from '../../components/Table.vue';
import TableMixin from '../../mixins/table';

@Component({
    components: {
        'app-table': Table
    }
})
export default class AdminList extends mixins(TableMixin) {
    @State public baseUrl!: string;

    public colCfg: any[] = [
        { prop: 'id', label: 'ID', sortable: true, width: 120 },
        { prop: 'adminName', label: '管理员名称', width: 160 },
        { prop: 'sex', label: '性别', width: 120 },
        { prop: 'department', label: '部门', width: 120 },
        { prop: 'job', label: '职位', width: 120 },
        { prop: 'level', label: '等级', sortable: true, width: 120 },
        { prop: 'phone', label: '电话号码', width: 200 },
        { prop: 'workNo', label: '工号', width: 120 },
        { prop: 'job', label: '职位', width: 120 }
    ];

    public del(row: any) {
        console.log(row);
    }

    public async _getData(page: number, pageSize: number) {
        // TODO: 换为请求
        // 模拟数据
        const res: any = {
            adminName: '曾钰涵2',
            department: '销售部',
            id: 4,
            job: '销售经理',
            level: 'T1',
            phone: '13458685625',
            sex: 1,
            workNo: '111'
        };

        const data = [];
        for (let i = 0; i < pageSize; i++) {
            const tmp = { ...res };
            tmp.id = i;
            tmp.sex = res.sex ? '男' : '女';
            data.push(tmp);
        }

        return { count: 40, data };
    }
}
</script>

<style lang="postcss" module>
.table {
    width: 100%;
    font-size: 16px;
}

.thead {
    font-weight: bold;
    font-size: 18px;
    color: #000;

    & th {
        background: #eee !important;
    }
}
</style>