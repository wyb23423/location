<template>
    <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="padding-right: 20%"
    >
        <el-form-item label="所属组号" required prop="groupCode">
            <el-input v-model="form.groupCode"></el-input>
        </el-form-item>
        <el-form-item label="基站类型">
            <el-radio-group v-model="form.main">
                <el-radio :label="0xaa">从基站</el-radio>
                <el-radio :label="0x55">主基站</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="基站模式">
            <el-radio-group v-model="form.mode">
                <el-radio :label="0x11">单基站</el-radio>
                <el-radio :label="0x22">下行模式</el-radio>
                <el-radio :label="0x33">上行模式</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="距离参数" required prop="distance">
            <el-input v-model.number="form.distance">
                <template slot="append">
                    cm
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="基站信道">
            <el-radio-group v-model="form.channel">
                <el-radio :label="1"></el-radio>
                <el-radio :label="2"></el-radio>
                <el-radio :label="5"></el-radio>
            </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="时间补偿" required prop="time">
            <el-input
                v-model.number="form.time"
                prefix-icon="el-icon-timer"
            ></el-input>
        </el-form-item> -->
        <el-form-item label="频率等级" :class="$style.item">
            <el-rate
                v-model="form.power"
                :colors="colors"
                show-score
                :low-threshold="3"
                :high-threshold="8"
                :max="10"
                :class="$style.center"
            ></el-rate>
        </el-form-item>
        <el-form-item label="发送等级" :class="$style.item">
            <el-slider
                :class="$style.send"
                v-model="form.send"
                :max="0x0f"
                :min="0"
                show-stops
            >
            </el-slider>
        </el-form-item>
        <el-form-item>
            <el-button type="success" @click="onSubmit">设置</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Ref } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { SEND_PROTOCOL } from '@/constant/request';
import { Async } from '@/assets/utils/util';

interface PrimaryConfig {
    power: number;
    main: number;
    channel: number;
    send: number;
    mode: number;
    groupCode: string;
    baseCode: string;
    distance: number;
}

@Component
export default class Primary extends Vue {
    private static readonly HEAD = '234501';

    @Prop() public readonly ip!: string;
    @Prop() public readonly protocols!: string[];

    public readonly colors = ['#99A9BF', '#F7BA2A', '#FF9900'];
    public form = <PrimaryConfig>{
        power: 1,
        main: 0xaa,
        channel: 2,
        send: 1,
        mode: 0x11
    };
    public rules = {
        groupCode: {
            pattern: /^[0-9A-Fa-f]{1,4}$/,
            message:
                'groupCode is not a hexadecimal string less than 4 in length'
        },
        distance: {
            type: 'number',
            max: 0xffff,
            min: 0
        },
        time: {
            type: 'number',
            max: 0xffffffff,
            min: 0
        }
    };

    @Ref('form') private readonly elForm!: ElForm;

    public created() {
        const protocol = this.protocols.find(v => v.startsWith(Primary.HEAD));
        protocol && (this.form = <PrimaryConfig>this.parse(protocol));
    }

    @Async()
    public async onSubmit() {
        await this.elForm.validate();
        await this.$confirm('确认设置?');

        await this.$http.post(SEND_PROTOCOL, {
            ip: this.ip,
            protocol: '2341' + this.parse(this.form) + '0D0A'
        });
        this.$message.success('设置成功');
    }

    // 解析基站基本配置
    private parse(value: string | PrimaryConfig) {
        // [[key, byte]]
        const keys = [
            ['baseCode', 4],
            ['groupCode', 2],
            ['main', 1],
            ['mode', 1],
            ['distance', 2],
            ['channel', 1],
            ['time', 4],
            ['power', 1],
            ['send', 1]
        ];

        if (typeof value === 'string') {
            const data: IJson = {};

            let start: number = Primary.HEAD.length;
            keys.forEach(([k, byte], i) => {
                const str = value.substr(start, <number>byte * 2);
                data[k] = i > 1 ? +('0x' + str) : str.toUpperCase();
                start += <number>byte * 2;
            });

            return data;
        }

        return keys
            .reduce((a, [k, byte]) => {
                a.push(
                    value[<keyof PrimaryConfig>k]
                        .toString(16)
                        .padStart(<number>byte * 2, '0')
                );

                return a;
            }, [])
            .join('');
    }
}
</script>


<style lang="postcss" module>
.center {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
}

.item > div {
    position: relative;
}
.send > div {
    background-color: #e00;
}
</style>
