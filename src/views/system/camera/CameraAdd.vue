<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <el-form ref="form" :model="form" label-width="auto" style="width: 80%">
            <el-form-item label="摄像头IP：" required>
                <template v-for="i of [0, 1, 2, 3]">
                    <el-input
                        :key="i"
                        maxlength="3"
                        min="0"
                        max="255"
                        step="1"
                        v-model="form.ip[i]"
                        @input="next(i)"
                        :class="$style.ip"
                        ref="ip"
                    >
                        <span slot="append" v-if="i < 3">.</span>
                    </el-input>
                </template>
            </el-form-item>
            <el-form-item label="设备端口号：" prop="port" required>
                <el-input v-model.number="form.port" type="number"></el-input>
            </el-form-item>
            <el-form-item label="用户名：" prop="username" required>
                <el-input v-model="form.username"></el-input>
            </el-form-item>
            <el-form-item label="密码：" prop="password" required>
                <el-input v-model="form.password" type="password"></el-input>
            </el-form-item>
            <el-form-item label="窗口分割数: " prop="windowSplit" required>
                <el-select v-model="form.windowSplit" placeholder="请选择">
                    <el-option
                        v-for="v of [1, 2, 3, 4]"
                        :key="v"
                        :value="v"
                        :label="`${v}X${v}`"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="所在组号：" prop="groupCode" required>
                <el-input v-model="form.groupCode"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">立即提交</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import Vue from 'vue';
import { ElForm } from 'element-ui/types/form';
import { ElInput } from 'element-ui/types/input';

@Component
export default class CameraAdd extends Vue {
    public form: any = {};

    public created() {
        this.init();
    }

    public next(i: number) {
        const currValue = this.form.ip[i];
        const value = (parseInt(currValue, 10) || '') + '';
        this.$set(this.form.ip, i, value);

        if (value.length >= 3 && i < 3) {
            (<ElInput[]>this.$refs.ip)[i + 1].focus();
        }

        if (currValue.length <= 0 && i > 0) {
            (<ElInput[]>this.$refs.ip)[i - 1].focus();
        }
    }
    public onSubmit() {
        const isComplete = this.form.ip.every((v: string) => !isNaN(+v));

        const form = <ElForm>this.$refs.form;
        form.validate((valid: boolean) => {
            if (!isComplete) {
                return this.$message.warning('摄像头ip不完整');
            }

            if (isNaN(this.form.groupCode)) {
                return this.$message.warning('组号只能包含数字');
            }

            if (valid) {
                const now = Date.now();

                const data = { ...this.form };
                data.ip = this.form.ip.join('.');
                data.createTime = data.updateTime = Date.now();
                data.createUser = data.updateUser = 'string';

                console.log(data);
            }
        });
    }
    public reset() {
        (<ElForm>this.$refs.form).resetFields();
        this.init();
    }

    private init() {
        this.form = {
            username: '',
            ip: ['', '', '', ''],
            port: '',
            groupCode: '',
            windowSplit: 1,
            password: ''
        };
    }
}
</script>

<style lang="postcss" module>
.ip {
    width: auto !important;

    & input {
        width: 50px;
        padding: 10px;
        border-radius: 0.25rem !important;
    }

    & > div {
        padding: 0 5px !important;
        vertical-align: bottom;
        background: none;
    }
}
</style>

