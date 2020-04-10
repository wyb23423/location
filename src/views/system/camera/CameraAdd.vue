<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <el-form ref="form" :model="form" label-width="auto" style="width: 80%">
            <el-form-item label="摄像头品牌：" required>
                <el-select v-model="form.brand" @change="reset">
                    <el-option
                        v-for="(item, index) of CAMERA_BRAND"
                        :key="item"
                        :label="item"
                        :value="index"
                    ></el-option>
                </el-select>
            </el-form-item>
            <template v-if="!isOtherBrand">
                <el-form-item label="摄像头IP：" required>
                    <ip-input v-model="form.ip"></ip-input>
                </el-form-item>
                <el-form-item label="设备端口号：" prop="port" required>
                    <el-input
                        v-model.number="form.port"
                        type="number"
                    ></el-input>
                </el-form-item>
                <el-form-item label="用户名：" prop="username" required>
                    <el-input v-model="form.username"></el-input>
                    <!-- 防止自动填充 -->
                    <el-input class="hidden"></el-input>
                </el-form-item>
                <el-form-item label="密码：" prop="password" required>
                    <!-- 防止自动填充 -->
                    <el-input class="hidden" type="password"></el-input>
                    <el-input
                        v-model="form.password"
                        type="password"
                    ></el-input>
                </el-form-item>
            </template>
            <el-form-item label="所在组号：" prop="groupId" required>
                <app-select
                    :url="GET_GROUP"
                    v-model="form.groupId"
                    :keys="{ id: 'id', name: 'id' }"
                ></app-select>
            </el-form-item>
            <el-form-item label="取流地址" prop="url" :required="isOtherBrand">
                <el-input type="url" v-model="form.url">
                    <template slot="prepend">rtsp://</template>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">立即提交</el-button>
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
import { GET_GROUP, REQUEST_CAMERA } from '@/constant/request';
import { Async, getConfig } from '../../../assets/utils/util';
import { Prop, Ref } from 'vue-property-decorator';
import Select from '@/components/form/Select.vue';

interface CameraFormData<T = [string, string, string, string]> extends ICamera {
    ip: T;
    port: number; // 设备端口号
    username: string;
    password: string;
    brand: number;
}

@Component({
    components: {
        'ip-input': IpInput,
        'app-select': Select
    }
})
export default class CameraAdd extends Vue {
    @Prop({ default: () => 'PUT' }) public readonly method!: 'PUT' | 'POST';
    @Prop({ default: () => ({ brand: 0, ip: ['', '', '', ''] }) })
    public form!: CameraFormData;

    public readonly GET_GROUP = GET_GROUP;
    public readonly CAMERA_BRAND = ['海康', '大华', '其他'];

    @Ref('form') private readonly formEl!: ElForm;

    public get isOtherBrand() {
        const index = this.form.brand;
        return (
            !this.CAMERA_BRAND[index] || index >= this.CAMERA_BRAND.length - 1
        );
    }

    @Async()
    public async onSubmit() {
        if (!this.isOtherBrand && this.form.ip.some((v: string) => !v)) {
            return this.$message.warning('摄像头ip不完整');
        }

        await this.formEl.validate();

        const data = { ...this.form, ip: this.form.ip.join('.') };
        data.url = this.resolveUrl(data);

        await this.$http.request({
            url: REQUEST_CAMERA,
            method: this.method,
            data,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.$message.success('操作成功');
        if (this.method === 'PUT') {
            this.formEl.resetFields();
            this.form.ip = ['', '', '', ''];
        }
    }

    public reset() {
        this.formEl.clearValidate();
    }

    private resolveUrl(data: CameraFormData<string>) {
        const RTSP = getConfig('rtsp', [
            'rtsp://[username]:[password]@[ip]:[port]/h264/ch1/main/av_stream',
            'rtsp://[username]:[password]@[ip]:[port]/cam/realmonitor?channel=1&subtype=0',
            'rtsp://[url]'
        ]);

        let rtsp = RTSP[2];
        if (!data.url && !this.isOtherBrand) {
            rtsp = RTSP[data.brand] || rtsp;
        }

        return rtsp.replace(
            /\[([a-z]+)\]/g,
            (_, key: keyof CameraFormData) => data[key] + ''
        );
    }
}
</script>

