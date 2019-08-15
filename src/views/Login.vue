<template>
    <div
        style="background: #007DDB;"
        :style="{ height: `${100 / scale}vh` }"
        class="flex-center"
    >
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
                    ></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        :disabled="!isVaild"
                        @click="submit('loginForm')"
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
import { Message } from 'element-ui';
import Router from 'vue-router';
import { State } from 'vuex-class/lib/bindings';
import { initRouter } from '@/router';

interface LoginInfo {
    password: string;
    username: string;
}

@Component
export default class Login extends Vue {
    @State('rootScale') public scale!: number;

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

    public submit(name: string) {
        const form: any = this.$refs[name];
        form.validate((valid: boolean) => {
            if (valid) {
                fetch('/api/admin/login', {
                    body: JSON.stringify(this.form),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(res => res.json())
                    .then((res: ResponseData) => {
                        if (res.code === 200) {
                            sessionStorage.setItem('login', '1');

                            const admin = res.pagedData
                                ? res.pagedData.datas[0]
                                : '';

                            return Promise.resolve(
                                admin
                                    ? JSON.stringify(admin.admin || admin)
                                    : ''
                            );
                        } else {
                            return Promise.reject({
                                message: '账号或密码错误, 登陆失败!'
                            });
                        }
                    })
                    .then((user: string) => {
                        user && sessionStorage.setItem('user', user);
                        initRouter();

                        this.$router.push('/');
                    })
                    .catch((e: any) => this.$message.error(e.message))
                    .finally(() => form && form.resetFields());
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

