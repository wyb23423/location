<template>
    <div style="background: #007DDB; height: 100vh" class="flex-center">
        <el-card :class="$style['box-card']" class="flex-center">
            <div :class="$style.title">
                <h1>莱恩微定位</h1>
                <h3>后台管理登录</h3>
            </div>
            <el-form
                :model="form"
                :rules="rules"
                :status-icon="true"
                label-width="auto"
                ref="loginForm"
            >
                <el-form-item label="用户账号" prop="username">
                    <el-input
                        v-model="form.username"
                        placeholder="请输入账号"
                        prefix-icon="el-icon-user-solid"
                    ></el-input>
                </el-form-item>
                <el-form-item label="用户密码" prop="password">
                    <el-input
                        v-model="form.password"
                        placeholder="请输入密码"
                        prefix-icon="el-icon-lock"
                        type="password"
                        @keyup.enter.native="submit"
                    ></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        :disabled="!isVaild"
                        @click="submit"
                    >
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { initRouter } from '@/router';
import { ElForm } from 'element-ui/types/form';
import { load } from '@/assets/utils/download';

interface LoginInfo {
    password: string;
    username: string;
}

@Component
export default class Login extends Vue {
    public form: LoginInfo = { password: '', username: '' };
    public rules = {
        username: [
            { min: 5, message: '用户名至少得5个字符啊', trigger: 'change' },
            { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
            { min: 6, max: 12, message: '密码必须6到12位', trigger: 'change' },
            { required: true, message: '请输入密码', trigger: 'blur' }
        ]
    };

    public submit() {
        const form = <ElForm>this.$refs.loginForm;
        form.validate(async (valid: boolean) => {
            if (valid) {
                try {
                    const res = await this.$http.post({
                        url: '/api/admin/login',
                        body: this.form,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // =======================设置登录信息
                    sessionStorage.setItem('login', '1');
                    sessionStorage.setItem(
                        'user',
                        JSON.stringify(res.pagedData.datas[0].admin)
                    );
                    // =====================================

                    initRouter(); // 加载路由
                    load('/api/tag/getall', 'id', 'tag'); // 慢加载标签数据

                    this.$router.push('/');
                } catch (e) {
                    //
                }

                form && form.resetFields();
            }
        });
    }

    public get isVaild() {
        const nameLength = this.form.username.length;
        const passLength = this.form.password.length;

        return nameLength >= 5 && passLength >= 6 && passLength <= 12;
    }
}
</script>

<style lang="postcss" module>
.title {
    text-align: center;
    color: #2699ed;

    & * {
        margin-bottom: 50px;
    }
}
.box-card {
    width: 500px;
    height: 500px;

    & > * {
        width: 100%;
    }
}
</style>

