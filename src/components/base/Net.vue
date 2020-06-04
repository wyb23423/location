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
        <el-form-item label="传输模式" required>
            <el-radio-group v-model="form.mode">
                <el-radio :label="0x55">UDP</el-radio>
                <el-radio :label="0xaa">TCP</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item prop="name" label="设备名称">
            <el-input v-model="form.name"></el-input>
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
import IpInput from '@/components/form/IpInput.vue';
import { ElForm } from 'element-ui/types/form';
import { SEND_PROTOCOL } from '@/constant/request';
import { Async } from '../../assets/utils/util';

@Component({
    components: {
        'ip-input': IpInput
    }
})
export default class Net extends Vue {
    private static readonly HEAD = ['234502', '234503', '234504'];

    @Prop() public ip!: string;
    @Prop() public readonly protocols!: string[];

    public form = {
        baseIp: <string[]>[],
        serverIp: <string[]>[],
        mask: <string[]>[],
        mac: <string[]>[],
        mode: 85,
        name: ''
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
        },
        name: {
            required: true,
            max: 8
        }
    };

    public created() {
        this.protocols.forEach(v => {
            const i = Net.HEAD.findIndex(h => v.startsWith(h));
            i > -1 && Object.assign(this.form, this.parse(v, i));
        });
    }

    @Async()
    public async onSubmit() {
        if (this.isValid !== true) {
            return;
        }

        await (<ElForm>this.$refs.form).validate();
        await this.$confirm('确认设置?');
        await this.$http.post(SEND_PROTOCOL, {
            ip: this.ip,
            protocol: '2342' + this.parse(this.form) + '0D0A'
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
    private parse(value: string | Record<string, any>, index?: number) {
        // [[key, byte, 是否用数组表示]]
        const keys: Array<[string, number, boolean]> = [
            ['baseIp', 4, true],
            ['mask', 4, true],
            ['mac', 6, true],
            ['basePort', 2, false],
            ['serverIp', 4, true],
            ['serverPort', 2, false],
            ['mode', 1, false]
        ];

        if (typeof value === 'string') {
            const key = <keyof Net>('str2obj' + index);
            return this[key](keys, value);
        }

        return this.obj2str(keys, value) + this.name2code();
    }

    private str2obj0(keys: Array<[string, number, boolean]>, value: string) {
        keys = keys.slice(0, 4);
        return this.str2obj(keys, value, Net.HEAD[0].length);
    }

    private str2obj1(keys: Array<[string, number, boolean]>, value: string) {
        keys = keys.slice(4);
        return this.str2obj(keys, value, Net.HEAD[1].length);
    }

    private str2obj2(keys: Array<[string, number, boolean]>, value: string) {
        value = value.substr(Net.HEAD[2].length, 32);
        const arr = value.match(/[\dA-Fa-f]{4}/g) || [];
        return {
            name: arr
                .map(v => String.fromCodePoint(+`0x${v}`))
                .join('')
                .trim()
        };
    }

    // 配置命令串转显示用对象
    private str2obj(
        keys: Array<[string, number, boolean]>,
        value: string,
        start: number = 6
    ) {
        const parse210 = (v: string) => +('0x' + v);
        const parseToArr = (s: number, l: number) => {
            const arr = value.substr(s, l).match(/[\dA-Fa-f]{2}/g) || [];

            return arr.map(parse210);
        };

        const data: Record<string, any> = {};
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
    private obj2str(
        keys: Array<[string, number, boolean]>,
        value: Record<string, any>
    ) {
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
            }, <string[]>[])
            .join('');
    }

    private name2code() {
        if (!this.form.name) {
            return '0020'.repeat(8);
        }

        return new Array(8)
            .fill('0020')
            .map((v, i) => {
                const code = this.form.name.codePointAt(i);
                return code?.toString(16).padStart(4, '0') ?? v;
            })
            .join('');
    }
}
</script>

