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
                <el-radio :label="85">从基站</el-radio>
                <el-radio :label="170">主基站</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="基站模式">
            <el-radio-group v-model="form.mode">
                <el-radio :label="17">单基站</el-radio>
                <el-radio :label="34">下行模式</el-radio>
                <el-radio :label="51">上行模式</el-radio>
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
                <el-radio :label="2"></el-radio>
                <el-radio :label="5"></el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="时间补偿" required prop="time">
            <el-input
                v-model.number="form.time"
                prefix-icon="el-icon-timer"
            ></el-input>
        </el-form-item>
        <el-form-item label="频率等级" :class="$style.item">
            <el-rate
                v-model="form.power"
                :colors="colors"
                show-score
                :class="$style.center"
            ></el-rate>
        </el-form-item>
        <el-form-item label="发送等级" :class="$style.item">
            <el-rate
                v-model="form.send"
                :colors="colors"
                :max="3"
                :low-threshold="1"
                :high-threshold="3"
                show-score
                :class="$style.center"
            >
            </el-rate>
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

@Component
export default class Primary extends Vue {
    @Ref('form') public readonly elForm!: ElForm;
    @Prop() public readonly data!: IBaseStation;

    public readonly colors: string[] = ['#99A9BF', '#F7BA2A', '#FF9900'];
    public form: IJson = {
        power: 1,
        main: 85,
        channel: 2,
        send: 1,
        mode: 17
    };
    public rules = {
        groupCode: {
            pattern: /^[0-9A-Fa-f]{1, 4}$/,
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

    public onSubmit() {
        this.elForm
            .validate()
            .then(() => this.$confirm('确认设置?'))
            .then(() =>
                this.$http.post('/api/protocol/sendProtocol', {
                    ip: this.data.ip,
                    port: 50000,
                    protocol: '41' + this.parse(this.form)
                })
            )
            .then(() => this.$message.success('设置成功'))
            .catch(console.log);
    }

    // 解析基站基本配置
    private parse(value: string | IJson) {
        // [[key, byte]]
        const keys = [
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

            let start: number = 0;
            keys.forEach(([k, byte]) => {
                const str = value.substr(start, <number>byte * 2);
                data[k] = start ? +('0x' + str) : str.toUpperCase();
                start += <number>byte * 2;
            });

            return data;
        }

        return keys
            .reduce((a, [k, byte]) => {
                a.push(value[k].toString(16).padStart(<number>byte * 2, '0'));

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
</style>
