<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="op"
                :op-width="120"
                @del="remove"
                @update="openDialog"
                @updateData="getData"
                @toExcel="toExcel"
            >
                <el-button
                    icon="el-icon-plus"
                    size="mini"
                    type="success"
                    @click="openDialog()"
                >
                    添加
                </el-button>
            </app-table>
        </el-card>

        <el-dialog
            title="电子围栏报警"
            :visible.sync="isDialogOpen"
            :modal-append-to-body="false"
            width="550px"
        >
            <el-form :model="form" ref="form" label-width="auto">
                <el-form-item
                    label="标签"
                    prop="tagNo"
                    v-if="form.id == null"
                    required
                >
                    <tag-select
                        ref="tagSelect"
                        @change="selectTag"
                    ></tag-select>
                </el-form-item>
                <el-form-item label="区域" prop="zoneId" required>
                    <el-select v-model="form.zoneId" multiple>
                        <el-option
                            v-for="v of zones"
                            :key="v.id"
                            :value="v.id"
                            :label="v.name"
                        ></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template slot="footer">
                <el-button @click="isDialogOpen = false">取 消</el-button>
                <el-button type="primary" @click="submit">
                    {{ form.id == null ? '添 加' : '更 新' }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import { ZoneMode } from '@/store';
import { ElSelect } from 'element-ui/types/select';
import { ElOption } from 'element-ui/types/option';
import { Async } from '@/assets/utils/await';
import TagSelect from '@/components/form/TagSelect.vue';
import {
    GET_ZONE,
    UPDATE_TAG_ZONE,
    GET_TAG_ZONE
} from '../../constant/request';
import Table from '@/components/Table.vue';
import TableMixin, { ColCfgItem } from '@/mixins/table';
import { Ref } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';

@Component({
    components: {
        'tag-select': TagSelect,
        'app-table': Table
    }
})
export default class TagZone extends mixins(TableMixin) {
    @State public zoneMode!: ZoneMode;

    public form = <ITagZone>{};
    public zones: IZone[] = [];
    public isDialogOpen = false;

    public colCfg: ColCfgItem[] = [
        { prop: 'id', label: '编号', width: 100 },
        { prop: 'tagNo', label: '标签', width: 120 },
        { prop: 'zoneId', label: '区域', width: 120 }
    ];

    @Ref('form') private readonly elForm!: ElForm;
    @Ref('tagSelect') private readonly tagSelect!: TagSelect;

    public get op() {
        return [
            { type: 'danger', name: 'del', desc: '删除' },
            { type: 'warning', name: 'update', desc: '设置' }
        ];
    }

    // 更新/添加
    @Async()
    public async submit() {
        await this.elForm.validate();
        this.form.id == null ? this.doAdd() : this.doUpdate();
    }

    public openDialog(data?: ITagZone) {
        this.isDialogOpen = true;
        const form = (this.form = <ITagZone>{
            zoneId: [],
            tagNo: '',
            // type: TAG_ZONE_TYPE.IN,
            ...(data || {})
        });

        this.$nextTick(
            () => this.tagSelect && this.tagSelect.setValue(form.tagNo)
        );
    }

    // 删除
    @Async()
    public async remove(data: ITagZone) {
        await this.$confirm(`删除id为${data.id}电子围栏报警设置`);
        this.$message.warning('没有提供删除接口');
        // await this.$http.post(UPDATE_TAG_ZONE, {
        //     tagNo: data.tagNo,
        //     zoneIds: null
        // });
        // this.refresh().$message.success('删除成功');
    }

    public selectTag(id: string, { name }: ITag) {
        this.form.tagNo = id;
        // this.form.tagName = name;
    }

    @Async(() => ({ count: 0, data: [] }))
    protected async fetch(page: number, pageSize: number) {
        const promises: [
            Promise<IZone[]>,
            Promise<ResponseData<ITagZone<string>>>
        ] = [
            Promise.resolve().then(() => {
                if (this.zones.length) {
                    return this.zones;
                }

                return this.fetchZone();
            }),
            Promise.resolve().then(this.fetchTagZone.bind(this, page, pageSize))
        ];

        const [
            zones,
            {
                pagedData: { datas, totalCount }
            }
        ] = await Promise.all(promises);

        return {
            count: totalCount,
            data: datas
        };
    }

    @Async()
    private async doAdd() {
        const data = { tagNo: this.form.tagNo, zoneIds: this.form.zoneId };
        await this.$http.post(UPDATE_TAG_ZONE, data, {
            'Content-Type': 'application/json'
        });

        if (this.tableData.length < this.pageSize) {
            this.refresh(false);
        }
        this.$message.success('添加成功');
        this.elForm.resetFields();
        this.tagSelect.reset();
    }

    @Async()
    private async doUpdate() {
        await this.$confirm('确认提交修改?');
        const data = { tagNo: this.form.tagNo, zoneIds: this.form.zoneId };
        await this.$http.post(UPDATE_TAG_ZONE, data, {
            'Content-Type': 'application/json'
        });

        const index = this.tableData.findIndex(v => v.id === this.form.id);
        if (index > -1) {
            this.tableData[index].zoneId = this.form.zoneId;
        }

        this.$message.success('更新成功');
    }

    // 获取Zone数据
    private async fetchZone() {
        const {
            pagedData: { datas }
        }: ResponseData<IZone> = await this.$http.get(GET_ZONE, {
            pageSize: 100_000,
            currentPage: 1
        });

        const zones = (this.zones = datas.filter(this.isFence, this));

        return zones;
    }

    private isFence({ mode }: IZone) {
        const { group, switch: switchMode } = this.zoneMode;
        return mode !== group && mode !== switchMode;
    }

    private fetchTagZone(currentPage: number, pageSize: number) {
        return this.$http.get(GET_TAG_ZONE, { currentPage, pageSize });
    }
}
</script>
