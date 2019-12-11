<template>
    <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="padding-right: 20%"
    >
        <el-form-item label="基站IP" required>
            <ip-input v-model="form.baseIp"></ip-input>
        </el-form-item>
        <el-form-item label="基站MASK" required>
            <ip-input v-model="form.mask"></ip-input>
        </el-form-item>
        <el-form-item label="基站MAC" required>
            <ip-input v-model="form.mac" :length="6"></ip-input>
        </el-form-item>
        <el-form-item label="基站端口" prop="basePort">
            <el-input v-model.number="form.basePort"></el-input>
        </el-form-item>
        <el-form-item label="服务器IP" required>
            <ip-input v-model="form.serverIp"></ip-input>
        </el-form-item>
        <el-form-item label="服务器端口" prop="serverPort">
            <el-input v-model.number="form.serverPort"></el-input>
        </el-form-item>
        <el-form-item label="传输模式">
            <el-radio-group v-model="form.mode">
                <el-radio :label="85">UDP</el-radio>
                <el-radio :label="170">TCP</el-radio>
            </el-radio-group>
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
import IpInput from '../../components/form/IpInput.vue';
import { ElForm } from 'element-ui/types/form';
import { SEND_PROTOCOL } from '@/constant/request';
import { Async } from '../../assets/utils/util';

@Component({
    components: {
        'ip-input': IpInput
    }
})
export default class Net extends Vue {
    @Prop() public data!: IBaseStation;

    public form = {
        baseIp: <string[]>[],
        serverIp: <string[]>[],
        mask: <string[]>[],
        mac: <string[]>[],
        mode: 85
    };
    public rules = {
        basePort: {
            type: 'number',
            max: 0xffff,
            required: true
        },
        serverPort: {
            type: 'number',
            max: 0xffff,
            required: true
        }
    };

    @Async()
    public async onSubmit() {
        if (this.isValid !== true) {
            return;
        }

        await (<ElForm>this.$refs.form).validate();
        await this.$confirm('确认设置?');
        await this.$http.post(SEND_PROTOCOL, {
            ip: this.data.ip,
            port: 50000,
            protocol: '42' + this.parse(this.form)
        });

        this.$message.success('设置成功');
    }

    private get isValid() {
        const { baseIp, mask, mac, serverIp } = this.form;
        if (baseIp.filter(v => !!v).length !== 4) {
            return this.$message.error('基站IP格式错误');
        }
        if (mask.filter(v => !!v).length !== 4) {
            return this.$message.error('基站mask格式错误');
        }
        if (mac.filter(v => !!v).length !== 6) {
            return this.$message.error('基站mac格式错误');
        }
        if (serverIp.filter(v => !!v).length !== 4) {
            return this.$message.error('服务器IP格式错误');
        }

        return true;
    }

    // 解析基站网络设置
    private parse(value: string | IJson) {
        // [[key, byte, 是否用数组表示]]
        const keys = [
            ['baseIp', 4, true],
            ['mask', 4, true],
            ['mac', 6, true],
            ['basePort', 2, false],
            ['serverIp', 4, true],
            ['serverPort', 2, false],
            ['mode', 1, false]
        ];

        if (typeof value === 'string') {
            return this.str2obj(keys, value);
        }

        return this.obj2str(keys, value);
    }

    // 配置命令串转显示用对象
    private str2obj(keys: any[], value: string) {
        const parse210 = (v: string) => +('0x' + v);
        const parseToArr = (s: number, l: number) => {
            const arr = value.substr(s, l).match(/\d{2}/g) || [];

            return arr.map(parse210);
        };

        const data: IJson = {};
        let start: number = 0;
        keys.forEach(([k, byte, isArr]) => {
            const len = <number>byte * 2;

            data[<string>k] = isArr
                ? parseToArr(start, len)
                : parse210(value.substr(start, len));

            start += len;
        });

        return data;
    }

    // 显示对象转配置命令串
    private obj2str(keys: any[], value: IJson) {
        return keys
            .reduce((a, [k, byte]) => {
                let str: number | string | number[] = value[k];
                if (Array.isArray(str)) {
                    str = str
                        .map(v => v.toString(16).padStart(2, '0'))
                        .join('');
                } else {
                    str = (+str).toString(16).padStart(byte * 2, '0');
                }

                a.push(str);

                return a;
            }, [])
            .join('');
    }
}
</script>

