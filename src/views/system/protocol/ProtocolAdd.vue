<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">
            协议添加
        </h3>
        <el-form ref="form" :model="form" label-width="auto" style="width: 80%">
            <el-form-item label="协议名称：" prop="name" required>
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="协议作用：" prop="effect" required>
                <el-input v-model="form.effect"></el-input>
            </el-form-item>
            <el-form-item label="协议内容：" prop="content" required>
                <el-input v-model="form.content"></el-input>
            </el-form-item>
            <el-form-item label="设备端口号：" prop="port" required>
                <el-input v-model.number="form.port" type="number"></el-input>
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
import Vue from 'vue';
import { ElForm } from 'element-ui/types/form';
import { ElInput } from 'element-ui/types/input';

@Component
export default class ProtocolAdd extends Vue {
    public form: any = {};

    public created() {
        this.init();
    }

    public onSubmit() {
        const form = <ElForm>this.$refs.form;
        form.validate((valid: boolean) => {
            if (valid) {
                const data = { ...this.form };
                data.createTime = data.updateTime = Date.now();
                data.createUser = data.updateUser = 'string';

                this.$http
                    .post('/api/protocol/addProtocol', data, {
                        'Content-Type': 'application/json'
                    })
                    .then(() => {
                        this.$message.success('添加成功');
                        this.reset();
                    })
                    .catch(console.log);
            }
        });
    }
    public reset() {
        (<ElForm>this.$refs.form).resetFields();
        this.init();
    }

    private init() {
        this.form = {
            name: '',
            port: '',
            effect: '',
            content: ''
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

