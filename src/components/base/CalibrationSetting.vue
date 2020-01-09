<template>
    <el-dialog
        title="配置校准值"
        :visible="!!visible"
        :modal-append-to-body="false"
        width="80%"
        top="5vh"
        @close="$emit('close')"
    >
        <app-table
            :max-height="300"
            :table-data="tableData"
            :col-cfg="colCfg"
            :total-count="totalCount"
            :noPrint="true"
            :isSmall="true"
            @updateData="getData"
        ></app-table>

        <el-divider content-position="left">输入参数</el-divider>
        <el-form
            :model="form"
            style="padding-left: 10%;"
            ref="tag"
            label-width="auto"
        >
            <el-form-item prop="tagId" label="标签" required>
                <tag-select @change="form.tagId = $event"></tag-select>
            </el-form-item>
            <el-form-item label="标签坐标" required>
                <el-col :span="6">
                    <el-form-item
                        prop="tag.x"
                        required
                        :rules="{ type: 'number' }"
                    >
                        <el-input
                            v-model.number="form.tag.x"
                            placeholder="x"
                        ></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6" :offset="1">
                    <el-form-item
                        prop="tag.y"
                        required
                        :rules="{ type: 'number' }"
                    >
                        <el-input
                            v-model.number="form.tag.y"
                            placeholder="y"
                        ></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6" :offset="1">
                    <el-form-item
                        prop="tag.z"
                        required
                        :rules="{ type: 'number' }"
                    >
                        <el-input
                            v-model.number="form.tag.z"
                            placeholder="z"
                        ></el-input>
                    </el-form-item>
                </el-col>
            </el-form-item>
            <el-form-item prop="number" required label="计算次数">
                <el-input-number
                    v-model="form.number"
                    :min="1"
                    step-strictly
                ></el-input-number>
            </el-form-item>
        </el-form>

        <template slot="footer">
            <el-button @click="$emit('close')">取 消</el-button>
            <el-button
                @click="calc"
                type="primary"
                :loading="loading"
                :disabled="loading"
            >
                计 算
            </el-button>
            <el-button @click="submit" :disabled="!canSubmit" type="success">
                提交
            </el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import TableMixin, { ColCfgItem } from '../../mixins/table';
import { Prop, Ref } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { major, subordinate } from '../../assets/utils/compensation';
import { Async } from '@/assets/utils/util';
import { UPDATE_BASE, GET_COMPENSATION } from '@/constant/request';
import TagSelect from '../form/TagSelect.vue';

interface CorrectionParams {
    tagId: string;
    number: number;
    tag: Vector3;
    groupId: string;
}

interface Calibration {
    compensation: Array<{ baseId: string; compensation: number }>;
}

@Component({
    components: {
        'tag-select': TagSelect
    }
})
export default class CalibrationSetting extends TableMixin {
    @Prop() public visible!: boolean;
    @Prop() public bases!: IBaseStation[];

    public form = <CorrectionParams>{
        tag: {},
        tagId: ''
    };

    public colCfg: ColCfgItem[] = [
        { prop: 'id', label: '基站编号', width: 80 },
        { prop: 'name', label: '基站名称', width: 120 },
        { prop: 'main', label: '主基站', width: 80 },
        { prop: 'ip', label: '基站IP', width: 100 },
        { prop: 'timeCorrectionValue', label: '时间补偿值', width: 180 }
    ];
    public canSubmit = false;
    public loading = false;

    @Ref('tag') private readonly tagForm!: ElForm;

    @Async()
    public async calc() {
        await this.tagForm.validate();
        this.loading = true;

        this.form.groupId = this.bases[0].groupId;
        const {
            resultMap: { compensation }
        }: ResponseData<any, Calibration> = await this.$http
            .post({
                url: GET_COMPENSATION,
                data: this.form,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .finally(() => (this.loading = false));

        if (!this.tagForm) {
            return;
        }

        this.tableData = (<IBaseStation[]>this.tableData).map(base => {
            const index = compensation.findIndex(v => v.baseId === base.id);
            if (index > -1) {
                base.timeCorrectionValue =
                    compensation[index].compensation + '';

                compensation.splice(index, 1);
            }

            return base;
        });
        this.canSubmit = true;
        this.$message.success('计算完成');
    }

    @Async()
    public async submit() {
        await Promise.all(
            this.tableData.map(v => this.$http.post(UPDATE_BASE, v))
        );

        this.$message.success('更新成功');
        this.$emit('refresh');
    }

    protected fetch(page: number, pageSize: number) {
        // const data = this.bases.slice((page - 1) * pageSize, page * pageSize);
        return Promise.resolve({
            count: this.bases.length,
            data: JSON.parse(JSON.stringify(this.bases))
        });
    }
}
</script>


