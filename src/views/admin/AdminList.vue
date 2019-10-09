<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="op"
                :op-width="160"
                @del="del"
                @setting="admin = $event"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>

        <template v-if="!!admin">
            <el-dialog
                title="更改管理员信息"
                :visible="!!admin"
                :modal-append-to-body="false"
                @close="admin = null"
            >
                <el-form :model="admin" label-width="auto" ref="form">
                    <el-form-item label="管理员名称" required prop="name">
                        <el-input
                            v-model="admin.name"
                            style="width: 70%"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="系统权限">
                        <permission
                            ref="permission"
                            :role="admin.role"
                        ></permission>
                    </el-form-item>
                </el-form>

                <template slot="footer">
                    <el-button @click="admin = null">取 消</el-button>
                    <el-button @click="submit" type="primary">确 定</el-button>
                </template>
            </el-dialog>
        </template>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import { TableRowOperation } from '@/components/Table.vue';
import Permission from '@/components/Permission.vue';
import { ElForm } from 'element-ui/types/form';
import { Ref } from 'vue-property-decorator';

@Component({
    components: {
        permission: Permission
    }
})
export default class AdminList extends mixins(TableMixin) {
    public colCfg: any[] = [
        { prop: 'username', label: '用户名', width: 140 },
        { prop: 'name', label: '管理员名称', width: 140 },
        {
            prop: 'sex',
            label: '性别',
            width: 120,
            formatter: val => (val ? '男' : '女')
        },
        { prop: 'department', label: '部门', width: 160 },
        { prop: 'job', label: '职位', width: 140 },
        { prop: 'phone', label: '电话号码', width: 200 }
    ];
    public admin: IAdmin | null = null;

    @Ref('permission') private readonly elPermission!: Permission;
    @Ref('form') private readonly elForm!: ElForm;

    public get op() {
        const op: TableRowOperation[] = [];
        if (this.permission.delete) {
            op.push({
                type: 'danger',
                name: 'del',
                desc: '删除',
                isDisable: this.isDisable
            });
        }
        if (this.permission.put) {
            op.push({
                type: 'primary',
                name: 'setting',
                desc: '配置',
                isDisable: this.isDisable
            });
        }

        return op;
    }

    public del(row: IAdmin) {
        this.$confirm(`删除${row.name}?`)
            .then(() =>
                this.$http.post('/api/admin/deleteAdmin', {
                    username: row.username
                })
            )
            .then(() => {
                this.$message.success('删除成功');
                this.refresh();
            })
            .catch(console.log);
    }

    public submit() {
        this.elForm
            .validate()
            .then(() => {
                Object.assign(this.admin, {
                    role: JSON.stringify(this.elPermission.parse())
                });

                return this.$http.post('/api/admin/updateAdmin', this.admin, {
                    'Content-Type': 'application/json'
                });
            })
            .then(() => this.$message.success('修改管理员信息成功'))
            .catch(console.log);
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get('/api/admin/getall', {
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

    private isDisable(admin: IAdmin): boolean {
        let user: string | IAdmin | null = sessionStorage.getItem('user');
        if (!user) {
            return true;
        }

        user = <IAdmin>JSON.parse(user);
        return admin.username === user.username;
    }
}
</script>

