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

        <div :class="$style.alert">
            校准者误差配置需要参数：基站坐标，标签实际坐标，标签距离基站距离(自动计算)，平均时间戳
        </div>

        <el-divider content-position="left">输入参数</el-divider>
        <el-form
            :model="form"
            :inline="true"
            :class="$style['tag-form']"
            ref="tag"
            label-width="auto"
        >
            <el-form-item
                prop="tagNo"
                label="标签"
                style="margin-right: 10%"
                required
            >
                <tag-select @change="form.tagNo = $event"></tag-select>
            </el-form-item>
            <el-form-item label="标签坐标" required style="width: 388px">
                <el-col :span="6">
                    <el-form-item prop="x" required :rules="{ type: 'number' }">
                        <el-input
                            v-model.number="form.x"
                            placeholder="x"
                        ></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6" :offset="1">
                    <el-form-item prop="y" required :rules="{ type: 'number' }">
                        <el-input
                            v-model.number="form.y"
                            placeholder="y"
                        ></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6" :offset="1">
                    <el-form-item prop="z" required :rules="{ type: 'number' }">
                        <el-input
                            v-model.number="form.z"
                            placeholder="z"
                        ></el-input>
                    </el-form-item>
                </el-col>
            </el-form-item>
            <el-form-item prop="count" required label="计算次数">
                <el-input-number
                    v-model="form.count"
                    :min="1"
                    step-strictly
                ></el-input-number>
            </el-form-item>
        </el-form>

        <template slot="footer">
            <el-button @click="$emit('close')">取 消</el-button>
            <el-button @click="calc" type="primary">计 算</el-button>
            <el-button @click="submit" :disabled="canSubmit" type="success">
                提交
            </el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin, { ColCfgItem } from '../../mixins/table';
import { Prop, Ref } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { major, subordinate } from '../../assets/utils/compensation';
import { Async } from '@/assets/utils/util';
import { UPDATE_BASE } from '@/constant/request';
import TagSelect from '../form/TagSelect.vue';

interface CorrectionParams extends Vector3 {
    tagNo: string;
    count: number;
}

@Component({
    components: {
        'tag-select': TagSelect
    }
})
export default class CalibrationSetting extends mixins(TableMixin) {
    @Prop() public visible!: boolean;
    @Prop() public bases!: IBaseStation[];

    public form = <CorrectionParams>{};

    public colCfg: ColCfgItem[] = [
        { prop: 'id', label: '基站编号' },
        { prop: 'name', label: '基站名称' },
        { prop: 'main', label: '主基站' },
        { prop: 'ip', label: '基站IP' },
        { prop: 'timeCorrectionValue', label: '时间补偿值' }
    ];
    public canSubmit = false;

    @Ref('tag') private readonly tagForm!: ElForm;

    @Async()
    public async calc() {
        await this.tagForm.validate();

        // TODO 发送请求
    }

    @Async()
    public async submit() {
        //
    }

    protected fetch(page: number, pageSize: number) {
        const data = this.bases.slice((page - 1) * pageSize, page * pageSize);
        return Promise.resolve({
            count: this.bases.length,
            data: JSON.parse(JSON.stringify(data))
        });
    }
}
</script>

<style lang="postcss" module>
.alert {
    margin: 40px 0 20px;
    padding: 15px;
    line-height: 22px;
    border-left: 5px solid #67c23a;
    border-radius: 0 2px 2px 0;
    background-color: #f2f2f2;
}

.tag-form {
    padding-left: 10%;
}
</style>

