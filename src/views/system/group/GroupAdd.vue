<template>
    <el-form
        ref="form"
        :model="form"
        label-width="auto"
        style="padding: 10% 8%"
    >
        <el-form-item
            v-if="showId"
            label="分组号"
            prop="groupCode"
            required
            :rules="{
                pattern: /^[0-9A-Fa-f]{1,4}$/,
                message:
                    'groupCode is not a hexadecimal string less than 4 in length'
            }"
        >
            <el-input v-model="form.groupCode"></el-input>
        </el-form-item>
        <el-form-item label="最大基站数" prop="groupBaseSize" required>
            <el-input-number
                :min="0"
                step-strictly
                v-model="form.groupBaseSize"
            ></el-input-number>
        </el-form-item>
        <el-form-item label="最小基站数" prop="minBaseSize" required>
            <el-input-number
                :min="0"
                step-strictly
                v-model="form.minBaseSize"
            ></el-input-number>
        </el-form-item>
        <el-form-item label="算法类型" required>
            <el-cascader
                v-model="algorithmType"
                :options="algorithm"
            ></el-cascader>
        </el-form-item>
        <el-form-item label="分组描述">
            <el-input v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="所属地图">
            <app-select url="/api/map/getall" v-model="form.mapId"></app-select>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Ref, Prop, Watch, Component } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { CascaderOption } from 'element-ui/types/cascader';
import Select from '@/components/Select.vue';

@Component({
    components: {
        'app-select': Select
    }
})
export default class GroupAdd extends Vue {
    @Prop({ default: () => ({ description: '' }) }) public form!: IGroup;
    @Prop({ default: () => true }) public showId!: boolean;

    public algorithmType: number[] = [];
    public algorithm: CascaderOption[] = [[0, 1, 2], [1, 2], [1, 2]].map(
        (v, i) => ({
            value: i + 1,
            label: ['一', '二', '三'][i] + '维算法',
            children: v.map(j => ({
                value: j,
                label: '序号' + j
            }))
        })
    );

    @Ref('form') private readonly elForm!: ElForm;

    public created() {
        this.getAlgorithmType();
    }

    public async onSubmit() {
        try {
            await this.elForm.validate();
        } catch (e) {
            return;
        }

        const data = { ...this.form };
        data.algorithmType = +this.algorithmType.join('');
        data.groupCode = data.groupCode.padStart(4, '0');

        this.$http
            .post(
                `/api/basegroup/${this.showId ? 'addGroup' : 'updateGroup'}`,
                data,
                { 'Content-Type': 'application/json' }
            )
            .then(() => {
                if (this.showId) {
                    this.$message.success('添加成功');
                    this.elForm.resetFields();
                } else {
                    this.$message.success('更新成功');
                }
            })
            .catch(console.log);

        this.$emit('input', data);
    }

    @Watch('form.algorithmType')
    public getAlgorithmType() {
        const algorithmType =
            this.form.algorithmType == null
                ? '10'
                : this.form.algorithmType + '';

        this.algorithmType = algorithmType.split('').map(Number);
    }
}
</script>