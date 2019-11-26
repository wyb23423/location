<template>
    <div style="padding: 5%; height: 100%" v-if="!person">
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
    </div>
    <div v-else :class="$style.info">
        <el-page-header
            @back="person = null"
            style="margin-bottom: 20px"
        ></el-page-header>

        <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="信息设置" name="info">
                <tag-add
                    :form="person"
                    :update="true"
                    ref="editForm"
                    @submit="submit"
                ></tag-add>
            </el-tab-pane>
            <el-tab-pane label="参数配置" name="parameter">
                <tag-config :tag-no="person.id"></tag-config>
            </el-tab-pane>
            <el-tab-pane label="更换标签" name="modifyId">
                <el-form label-width="100px" ref="tagNo">
                    <el-form-item
                        label="标签号"
                        :rules="{
                            pattern: /^[0-9A-Fa-f]{8}$/,
                            message:
                                'id is not a hexadecimal string of length 8'
                        }"
                        required
                    >
                        <el-input
                            v-model="tagNo"
                            @keyup.enter.native="modifyTagNo"
                            style="width: 60%"
                        ></el-input>
                    </el-form-item>

                    <!-- 阻止单表单域时触发enter提交 -->
                    <el-form-item v-show="false">
                        <el-input value="1"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button
                            type="success"
                            @click="modifyTagNo"
                            :disabled="tagNo === person.id"
                        >
                            立即提交
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import { Prop, Watch, Ref } from 'vue-property-decorator';
import { Route } from 'vue-router';
import TagAdd from './TagAdd.vue';
import { Async } from '../../assets/utils/util';
import TagConfig from '../../components/edit/TagConfig.vue';
import { ElForm } from 'element-ui/types/form';

@Component({
    components: {
        'tag-add': TagAdd,
        'tag-config': TagConfig
    }
})
export default class TagList extends mixins(TableMixin) {
    @Prop() public type!: number;
    @Prop() public permission!: Permission;

    public activeTab: string = 'info';
    public person: ITag | null = null;
    public colCfg: any[] = [
        { prop: 'id', label: '编号', width: 120 },
        { prop: 'name', label: '名称', width: 120 },
        { prop: 'content', label: '属性', width: 200 }
    ];
    public tagNo = '';

    @Ref('editForm') private readonly editForm!: TagAdd;
    @Ref('tagNo') private readonly tagNoForm!: ElForm;

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

    @Async()
    public async del(row: ITag) {
        await this.$confirm(`删除标签${row.name}?`);
        await this.$http.post('/api/tag/deleteTag', { id: row.id });
        this.refresh().$message.success('删除成功');
    }

    public setting(row: any) {
        this.person = { ...row };
        this.oldData = { ...row };
        this.tagNo = row.id;
    }

    @Async()
    public async submit(data: ITag) {
        await this.$confirm('确认修改?');

        const { name, img } = this.oldData!;
        if (data.name !== name || data.img !== img) {
            const [p1, p2] = await this.editForm.avator.getImgUrl(data.name);
            data.icon = p1.resultMap.photoUrl;

            if (data.img !== img) {
                data.img = p2.resultMap.photoUrl;
            }
        }

        await this.$http.post('/api/tag/updateTag', data, {
            'Content-Type': 'application/json'
        });
        this.refresh(false).$message.success('修改成功');
    }

    @Async()
    public async modifyTagNo() {
        const id = this.person!.id;
        if (this.tagNo === id) {
            return;
        }

        await this.tagNoForm.validate();
        await this.$confirm('确认修改标签号?');

        console.log(this.tagNo, id);
        this.person!.id = this.tagNo;
        this.refresh(false).$message.success('修改成功');
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

<style lang="postcss" module>
.info {
    height: 100%;
    padding: 3%;
    padding-bottom: 0;
}
</style>