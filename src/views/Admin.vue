<template>
    <div>
        <app-aside :tabs="tabs" ref="aside"></app-aside>
        <div class="main">
            <div :style="{ height, padding: '5%' }">
                <el-card class="card">
                    <div :class="$style.table">
                        <el-table
                            :data="tableData"
                            tooltip-effect="dark"
                            :border="true"
                            :header-row-class-name="$style.thead"
                        >
                            <el-table-column
                                v-for="(v, i) of colCfg"
                                :key="i"
                                :prop="v.prop"
                                :label="v.label"
                                :sortable="!!v.sortable"
                                :sort-orders="['ascending', 'descending']"
                                :resizable="true"
                                :width="v.width"
                            >
                            </el-table-column>
                            <el-table-column label="操作" :resizable="true">
                                <template slot-scope="scope">
                                    <el-button
                                        size="mini"
                                        type="danger"
                                        @click="del(scope.row.id)"
                                    >
                                        删除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Aside from '../components/Aside.vue';
import { Getter, State } from 'vuex-class/lib/bindings';

@Component({
    components: {
        'app-aside': Aside
    }
})
export default class Admin extends Vue {
    @Getter('mainHeight') public height?: string;
    @State('rootScale') public scale?: number;
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

    public tableData: any[] = [];
    public page: number = 1;
    public totalCount: number = 0;
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

    public created() {
        this.getData();
    }

    public del(index: number, row: any) {
        console.log(index, row);
    }

    private getData() {
        // TODO: 换为请求
        // 模拟数据
        const res = {
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
        for (let i = 0; i < 15; i++) {
            const tmp = { ...res };
            tmp.id = i;
            data.push(tmp);
        }

        this.tableData = data.map(v => {
            v.sex = v.sex ? '男' : '女';

            return v;
        });
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
    overflow-y: auto;
    padding: 5px 0;
    height: 85%;
}

.thead {
    font-weight: bold;
    font-size: 18px;
    color: #000;

    & th {
        background: #ccc !important;
    }
}
</style>