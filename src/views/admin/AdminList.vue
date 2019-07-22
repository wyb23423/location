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
                    <el-form-item label="管理员名称" required prop="adminName">
                        <el-input
                            v-model="admin.adminName"
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

@Component({
    components: {
        permission: Permission
    }
})
export default class AdminList extends mixins(TableMixin) {
    public colCfg: any[] = [
        { prop: 'id', label: 'ID', sortable: true, width: 100 },
        { prop: 'adminName', label: '管理员名称', width: 140 },
        { prop: 'sexName', label: '性别', width: 120 },
        { prop: 'department', label: '部门', width: 160 },
        { prop: 'job', label: '职位', width: 140 },
        { prop: 'level', label: '等级', sortable: true, width: 120 },
        { prop: 'phone', label: '电话号码', width: 200 },
        { prop: 'workNo', label: '工号', width: 100 }
    ];
    public admin: IAdmin | null = null;

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
        if (this.permission.post) {
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
        this.$confirm(`删除${row.adminName}?`)
            .then(() =>
                this.$http.post('/api/admin/deleteAdmin', { id: row.id })
            )
            .then(() => {
                this.$message.success('删除成功');
                this.refresh();
            })
            .catch(console.log);
    }

    public submit() {
        const form = <ElForm>this.$refs.form;
        form.validate((valid: boolean) => {
            if (valid) {
                const now = Date.now();
                Object.assign(this.admin, {
                    updateTime: now,
                    role: JSON.stringify(
                        (<Permission>this.$refs.permission).parse()
                    )
                });

                this.$http
                    .post('/api/admin/updateAdmin', this.admin, {
                        'Content-Type': 'application/json'
                    })
                    .then(() => this.$message.success('修改管理员信息成功'))
                    .catch(console.log);
            }
        });
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get('/api/admin/getall', {
                pageSize,
                currentPage: page
            });
            data = res.pagedData.datas.map((v: any) => {
                v.sexName = v.sex ? '男' : '女';
                return v;
            });

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
        return admin.id === user.id || admin.userName === user.userName;
    }
}
</script>

