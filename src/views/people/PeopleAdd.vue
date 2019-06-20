<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">人员添加</h3>
        <el-form ref="form" :model="form" label-width="auto" style="width: 80%">
            <el-form-item label="人员名称：" prop="name" required>
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="性别：" prop="sex">
                <el-radio-group v-model="form.sex">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="0">女</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="部门：" prop="department" required>
                <el-input v-model="form.department"></el-input>
            </el-form-item>
            <el-form-item label="职位：" prop="job" required>
                <el-input v-model="form.job"></el-input>
            </el-form-item>

            <el-form-item label="带领人：">
                <el-input v-model="form.leader"></el-input>
            </el-form-item>

            <el-form-item label="等级: " prop="level" inline-message>
                <el-select v-model="form.level">
                    <el-option
                        v-for="v of [1, 2, 3]"
                        :key="v"
                        :value="'T' + v"
                    ></el-option>
                </el-select>
            </el-form-item>

            <el-form-item
                label="电话号码："
                prop="phone"
                :rules="{ pattern: /^1[3456789]\d{9}$/ }"
                required
            >
                <el-input v-model.number="form.phone" type="number"></el-input>
            </el-form-item>
            <el-form-item label="标签号：" prop="tagNo" required>
                <el-input v-model="form.tagNo"></el-input>
            </el-form-item>
            <el-form-item label="人员类型：" prop="type">
                <el-radio-group v-model="form.type">
                    <el-radio :label="1">常驻</el-radio>
                    <el-radio :label="2">临时</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="添加原因：" v-if="form.type === 2">
                <el-input v-model="form.reason"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">立即创建</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { ElForm } from 'element-ui/types/form';

@Component
export default class PeopleAdd extends Vue {
    public form = {
        sex: 1,
        level: 'T1',
        type: 1,
        reason: ''
    };

    public onSubmit() {
        const form = <ElForm>this.$refs.form;
        form.validate((valid: boolean) => {
            if (valid) {
                // TODO 提交数据
                const now = Date.now();
                const data = Object.assign({}, this.form, {
                    createTime: now,
                    updateTime: now,
                    updateUser: 'string',
                    createUser: 'string',
                    locked: true
                });

                console.log(data);
            }
        });
    }

    public reset() {
        (<ElForm>this.$refs.form).resetFields();
    }
}
</script>
