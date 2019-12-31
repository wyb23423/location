<template>
    <el-form
        ref="form"
        :model="form"
        label-width="100px"
        style="padding-right: 20%"
    >
        <el-form-item label="坐标X：" prop="coordx" required>
            <el-input
                v-model.number="form.coordx"
                style="max-width: 300px;"
            ></el-input>
        </el-form-item>
        <el-form-item label="坐标Y：" prop="coordy" required>
            <el-input
                v-model.number="form.coordy"
                style="max-width: 300px;"
            ></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="success" @click="onSubmit">设置</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { GET_ZONE, UPDATE_BASE } from '@/constant/request';
import { Async } from '@/assets/utils/util';

@Component
export default class Position extends Vue {
    @Prop() public data!: IBaseStation;

    public form: any = {
        coordx: 0,
        coordy: 0
    };

    public created() {
        this.form.coordx = this.data.coordx;
        this.form.coordy = this.data.coordy;
    }

    @Async()
    public async onSubmit() {
        await (<ElForm>this.$refs.form).validate();
        await this.$confirm('确认修改');

        const data = Object.assign({}, this.data, this.form);
        await this.$http.post(UPDATE_BASE, data, {
            'Content-Type': 'application/json'
        });
        this.$message.success('修改成功');
    }
}
</script>

