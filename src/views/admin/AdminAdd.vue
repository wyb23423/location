<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">管理员基础信息</h3>
        <el-form
            ref="form"
            :model="form"
            :rules="rules"
            label-width="auto"
            style="width: 80%"
        >
            <el-form-item label="管理者名称：" prop="adminName">
                <el-input v-model="form.adminName"></el-input>
            </el-form-item>
            <el-form-item label="用户姓名：" prop="userName">
                <el-input v-model="form.userName"></el-input>
                <el-input class="hidden"></el-input>
            </el-form-item>
            <el-form-item label="登录密码：" prop="password">
                <el-input class="hidden" type="password"></el-input>
                <el-input v-model="form.password" type="password"></el-input>
            </el-form-item>
            <el-form-item label="性别：" prop="sex">
                <el-radio-group v-model="form.sex">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="0">女</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item
                label="所属部门："
                prop="department"
                :inline-message="true"
            >
                <el-input v-model="form.department"></el-input>
            </el-form-item>
            <el-form-item label="职位" prop="job" :inline-message="true">
                <el-input v-model="form.job"></el-input>
            </el-form-item>
            <el-form-item label="职位等级" prop="level">
                <el-radio-group v-model="form.level">
                    <el-radio label="T1"></el-radio>
                    <el-radio label="T2"></el-radio>
                    <el-radio label="T3"></el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="电话号码：" prop="phone">
                <el-input v-model.number="form.phone" type="number"></el-input>
            </el-form-item>
            <el-form-item label="工号：" prop="workNo">
                <el-input v-model="form.workNo"></el-input>
            </el-form-item>
            <el-form-item label="系统权限">
                <permission ref="permission"></permission>
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
import Permission from '@/components/Permission.vue';

@Component({
    components: {
        permission: Permission
    }
})
export default class AdminAdd extends Vue {
    public form = {
        adminName: '',
        userName: '',
        password: '',
        sex: 1,
        department: '',
        job: '',
        level: 'T1',
        phone: '',
        workNo: ''
    };
    public rules = {};

    public created() {
        Object.keys(this.form).forEach(k => {
            if (k !== 'sex' && k !== 'level') {
                const rules: any[] = [
                    {
                        required: true,
                        message: '必填项不能为空',
                        trigger: 'change'
                    }
                ];
                if (k === 'phone') {
                    rules.push({
                        pattern: /^1[3456789]\d{9}$/,
                        message: '无效电话号',
                        trigger: 'change'
                    });
                }

                (<any>this.rules)[k] = rules;
            }
        });
    }

    public onSubmit() {
        const form = <ElForm>this.$refs.form;
        form.validate((valid: boolean) => {
            if (valid) {
                const now = Date.now();
                const data = Object.assign({}, this.form, {
                    createTime: now,
                    updateTime: now,
                    role: JSON.stringify(
                        (<Permission>this.$refs.permission).parse()
                    )
                });

                this.$http
                    .post('/api/admin/addAdmin', data, {
                        'Content-Type': 'application/json'
                    })
                    .then(() => this.$message.success('添加成功'))
                    .catch(console.log);
            }
        });
    }

    public reset() {
        console.log(
            JSON.stringify((<Permission>this.$refs.permission).parse())
        );
        (<ElForm>this.$refs.form).resetFields();
    }
}
</script>
