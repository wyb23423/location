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
                            v-model="person.avatar"
                            ref="avator"
                        ></app-avator>
                    </el-form-item>
                    <el-form-item label="名称" required prop="name">
                        <el-input
                            v-model="person.name"
                            style="width: 80%"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="区域">
                        <el-select v-model="person.zone">
                            <el-option
                                v-for="v of zones.pagedData.datas"
                                :key="v.id"
                                :value="v.id + ''"
                                :label="v.name"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="属性">
                        <el-input
                            v-model="person.properties"
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
        { prop: 'id', label: 'ID', sortable: true, width: 100 },
        { prop: 'name', label: '名称', width: 120 },
        { prop: 'tagNo', label: '编号', width: 120 },
        { prop: 'zoneName', label: '区域', width: 120 },
        { prop: 'properties', label: '属性', width: 200 }
    ];
    public zones?: ResponseData;

    @Ref('avator') private readonly avator!: Avator;
    private oldData?: ITag;

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
            //
        }

        this.person.updateTime = Date.now();
        if (
            this.person.name === this.oldData.name &&
            this.person.name === this.oldData.avatar
        ) {
            this.person.photo = (await this.avator.getImgUrl(
                this.person.name
            ))[0].resultMap.photoUrl;
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
            const [res, zones] = await Promise.all([
                this.$http.get('/api/tag/getall', {
                    pageSize,
                    currentPage: page,
                    type: this.type || 1
                }),
                Promise.resolve().then(() => {
                    return (
                        this.zones ||
                        this.$http.get('/api/zone/getall', {
                            pageSize: 1000000,
                            currentPage: 1
                        })
                    );
                })
            ]);

            data = res.pagedData.datas.map((v: ITag) => {
                const zone = zones.pagedData.datas.find(
                    (z: any) => +z.id === +v.zone
                );
                v.zoneName = zone ? zone.name : '未知区域';

                return v;
            });

            count = res.pagedData.totalCount;

            this.zones = zones;
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

