<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <el-form ref="form" :model="form" label-width="auto" style="width: 80%">
            <el-form-item label="摄像头品牌：">
                <el-select v-model="form.brand">
                    <el-option
                        v-for="(item, index) of ['海康', '大华']"
                        :key="index"
                        :label="item"
                        :value="index + 1"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="摄像头IP：" required>
                <ip-input v-model="form.ip"></ip-input>
            </el-form-item>
            <el-form-item label="设备端口号：" prop="port" required>
                <el-input v-model.number="form.port" type="number"></el-input>
            </el-form-item>
            <el-form-item label="用户名：" prop="username" required>
                <el-input v-model="form.username"></el-input>
                <el-input class="hidden"></el-input>
            </el-form-item>
            <el-form-item label="密码：" prop="password" required>
                <el-input class="hidden" type="password"></el-input>
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
import IpInput from '../../../components/form/IpInput.vue';

@Component({
    components: {
        'ip-input': IpInput
    }
})
export default class CameraAdd extends Vue {
    public form: any = {};

    public created() {
        this.init();
    }

    public onSubmit() {
        const isComplete = this.form.ip.every((v: string) => !!v);

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

                this.$http
                    .post('/api/camera/addCamera', data, {
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
            username: '',
            ip: ['', '', '', ''],
            port: '',
            groupCode: '',
            windowSplit: 1,
            password: '',
            brand: 1
        };
    }
}
</script>

