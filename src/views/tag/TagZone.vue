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
                    prop="tagId"
                    v-if="form.id == null"
                    required
                >
                    <tag-select
                        ref="tagSelect"
                        @change="selectTag"
                    ></tag-select>
                </el-form-item>
                <el-form-item label="区域" prop="zoneId" required>
                    <el-select v-model="form.zoneId">
                        <el-option
                            v-for="v of zones"
                            :key="v.id"
                            :value="v.id"
                            :label="v.name"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="类型" prop="type" required>
                    <el-radio-group v-model="form.type">
                        <el-radio :label="tagZoneType.IN">进入报警</el-radio>
                        <el-radio :label="tagZoneType.OUT">离开报警</el-radio>
                    </el-radio-group>
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
import { TransferData } from 'element-ui/types/transfer';
import TagSelect from '@/components/form/TagSelect.vue';
import {
    GET_ZONE,
    UPDATE_TAG_ZONE,
    ADD_TAG_ZONE,
    RM_TAG_ZONE,
    GET_TAG_ZONE
} from '../../constant/request';
import Table from '@/components/Table.vue';
import TableMixin, { ColCfgItem } from '@/mixins/table';
import { Ref } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';

enum TAG_ZONE_TYPE {
    IN = 1,
    OUT = 2
}

@Component({
    components: {
        'tag-select': TagSelect,
        'app-table': Table
    }
})
export default class TagZone extends mixins(TableMixin) {
    @State public zoneMode!: ZoneMode;

    public form = <ITagZone>{};
    public tagZoneType = TAG_ZONE_TYPE;
    public zones: IZone[] = [];
    public isDialogOpen = false;

    public colCfg: ColCfgItem[] = [
        { prop: 'id', label: '编号', width: 100 },
        { prop: 'tagName', label: '标签', width: 120 },
        { prop: 'zoneName', label: '区域', width: 120 },
        {
            prop: 'type',
            label: '类型',
            width: 120,
            formatter: t => this.tagZoneType[t]
        }
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
            zoneId: '',
            tagId: '',
            type: TAG_ZONE_TYPE.IN,
            ...(data || {})
        });

        this.$nextTick(
            () => this.tagSelect && this.tagSelect.setValue(form.tagId)
        );
    }

    // 删除
    @Async()
    public async remove(data: ITagZone) {
        await this.$confirm(`删除id为${data.id}电子围栏报警设置`);
        // TODO 发送删除请求
        // await this.$http.post(RM_TAG_ZONE, { tagId: this.form.tagId });
        this.refresh().$message.success('删除成功');
    }

    public selectTag(id: string, { name }: ITag) {
        this.form.tagId = id;
        this.form.tagName = name;
    }

    @Async(() => ({ count: 0, data: [] }))
    protected async fetch(page: number, pageSize: number) {
        const promises: [Promise<IZone[]>, Promise<ITagZone[]>] = [
            Promise.resolve().then(() => {
                if (this.zones.length) {
                    return this.zones;
                }

                return this.fetchZone();
            }),
            Promise.resolve().then(this.fetchTagZone.bind(this, page, pageSize))
        ];

        const [zones, tagZones] = await Promise.all(promises);

        // TODO==================================================
        tagZones.forEach(v => {
            const index = Math.floor(v.zoneId / zones.length);
            v.zoneName = zones[v.zoneId % zones.length].name + index;
        });

        return { count: tagZones.length * 10, data: tagZones };
    }

    @Async()
    private async doAdd() {
        console.log({ ...this.form });

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
        console.log(this.form);

        const index = this.tableData.findIndex(v => v.id === this.form.id);
        if (index > -1) {
            const zone = this.zones.find(v => v.id === this.form.zoneId);
            if (zone) {
                this.form.zoneName = zone.name;
                this.$set(this.tableData, index, this.form);
            }
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

    private async fetchTagZone(page: number, pageSize: number) {
        // TODO 从服务器获取标签-区域关系
        return new Array(pageSize).fill(1).map<ITagZone>((v, i) => ({
            id: (page - 1) * pageSize + i,
            zoneId: i,
            tagId: '0001' + (i + 1).toString(16).padStart(4, '0'),
            type: Math.random() > 0.5 ? TAG_ZONE_TYPE.IN : TAG_ZONE_TYPE.OUT,
            tagName: '标签' + i
        }));
    }
}
</script>
