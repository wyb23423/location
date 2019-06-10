<template>
    <div>
        <app-aside :tabs="tabs" ref="aside"></app-aside>
        <div class="main">
            <div :style="{ height: mainHeight, padding: '5%' }">
                <el-card class="card" ref="table">
                    <app-table
                        :max-height="maxHeight"
                        :tableData="tableData"
                        :colCfg="colCfg"
                        :totalCount="totalCount"
                        :op="[{ type: 'danger', name: 'del', desc: '删除' }]"
                        @del="del"
                        @updateData="getData"
                    ></app-table>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Aside from '../components/Aside.vue';
import { Getter, State } from 'vuex-class/lib/bindings';
import Table from '../components/Table.vue';
import TableMixin from '../mixins/table';

@Component({
    components: {
        'app-aside': Aside,
        'app-table': Table
    }
})
export default class Admin extends mixins(TableMixin) {
    @Getter('mainHeight') public mainHeight?: string;
    @State public baseUrl?: string;

    public tabs = [
        { title: '管理员', to: 'admin', icon: 'el-icon-user' },
        {
            title: '增加人员',
            to: 'admin/add',
            icon: 'el-icon-circle-plus-outline'
        },
        { title: '权限管理', to: 'admin/chown ', icon: 'el-icon-s-operation' }
    ];

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

    public getData(page: number, pageSize: number) {
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

        this.tableData.length = 0;
        for (let i = 0; i < pageSize; i++) {
            const tmp = { ...res };
            tmp.id = i;
            tmp.sex = res.sex ? '男' : '女';
            this.tableData.push(tmp);
        }

        this.totalCount = 40;

        // fetch(this.baseUrl + '/api/admin/getall?currentPage=1&pageSize=15', {
        //     method: 'GET',
        //     mode: 'cors'
        // })
        //     .then(res => res.text())
        //     .then(console.log);
    }
}
</script>

<style lang="postcss" module>
.table {
    width: 100%;
    margin-top: 25px;
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