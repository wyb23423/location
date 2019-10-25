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
                @setting="setting"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>

        <template v-if="!!person">
            <el-dialog
                title="更改标签信息"
                :visible="!!person"
                :modal-append-to-body="false"
                @close="person = null"
            >
                <el-form :model="person" label-width="auto">
                    <el-form-item label="头像：">
                        <app-avator
                            v-model="person.img"
                            ref="avator"
                        ></app-avator>
                    </el-form-item>
                    <el-form-item label="名称" required prop="name">
                        <el-input
                            v-model="person.name"
                            style="width: 80%"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="属性">
                        <el-input
                            v-model="person.content"
                            placeholder="性别: 女, 部门: 研发"
                        ></el-input>
                    </el-form-item>
                </el-form>

                <template slot="footer">
                    <el-button @click="person = null">取 消</el-button>
                    <el-button @click="submit" type="primary">确 定</el-button>
                </template>
            </el-dialog>
        </template>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import { Prop, Watch, Ref } from 'vue-property-decorator';
import { Route } from 'vue-router';
import Avator from '@/components/Avator.vue';

@Component({
    components: {
        'app-avator': Avator
    }
})
export default class PeopleList extends mixins(TableMixin) {
    @Prop() public type!: number;
    @Prop() public permission!: Permission;

    public person: ITag | null = null;
    public colCfg: any[] = [
        { prop: 'id', label: '编号', width: 120 },
        { prop: 'name', label: '名称', width: 120 },
        { prop: 'content', label: '属性', width: 200 }
    ];

    @Ref('avator') private readonly avator!: Avator;
    private oldData?: ITag; // 用于比较是否需要重新上传图片

    public get op() {
        const op = [];
        if (this.permission.delete) {
            op.push({ type: 'danger', name: 'del', desc: '删除' });
        }
        if (this.permission.put) {
            op.push({ type: 'primary', name: 'setting', desc: '配置' });
        }

        return op;
    }

    public del(row: ITag) {
        this.$confirm(`删除标签${row.name}?`)
            .then(() => this.$http.post('/api/tag/deleteTag', { id: row.id }))
            .then(() => {
                this.$message.success('删除成功');
                this.refresh();
            })
            .catch(console.log);
    }

    public setting(row: any) {
        this.person = row;
        this.oldData = { ...row };
    }

    public async submit() {
        if (!(this.person && this.oldData)) {
            return;
        }

        if (!this.person.name) {
            return this.$message.warning('name is required!');
        }

        try {
            await this.$confirm('确认修改?');
        } catch (e) {
            return;
        }

        if (
            this.person.name !== this.oldData.name ||
            this.person.img !== this.oldData.img
        ) {
            const [p1, p2] = await this.avator.getImgUrl(this.person.name);
            this.person.icon = p1.resultMap.photoUrl;

            if (this.person.img !== this.oldData.img) {
                this.person.img = p2.resultMap.photoUrl;
            }
        }

        this.$http
            .post('/api/tag/updateTag', this.person, {
                'Content-Type': 'application/json'
            })
            .then(() => {
                this.$message.success('修改成功');
                this.refresh();
            })
            .catch(console.log);
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;

        try {
            const res = await this.$http.get('/api/tag/getall', {
                pageSize,
                currentPage: page,
                type: this.type || 1
            });

            data = res.pagedData.datas;
            count = res.pagedData.totalCount;
        } catch (e) {
            console.log(e);
        }

        return { count, data };
    }

    @Watch('$route.params.type')
    private routeUpdate() {
        this.getData(1, 10);
    }
}
</script>

