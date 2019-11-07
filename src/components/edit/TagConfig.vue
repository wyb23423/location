<template>
    <el-form :model="form" style="padding: 20px 5%">
        <el-form-item prop="heartRate" label="测试心率">
            <el-select v-model="form.heartRate">
                <el-option :value="0x70" label="开始"></el-option>
                <el-option :value="0x80" label="停止"></el-option>
                <el-option :value="0x90" label="1s/次"></el-option>
                <el-option :value="0xa0" label="5s/次"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item prop="channel" label="信道切换">
            <el-select v-model="form.channel">
                <el-option
                    v-for="v of [1, 2, 3, 5]"
                    :key="v"
                    :value="+('0x' + v)"
                    :label="'信道' + v"
                >
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button type="success" @click="submit">立即提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
/**
 * 通过协议配置标签
 */
import Vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';

@Component
export default class TagConfig extends Vue {
    private static readonly COMMAND = 0x49;

    @Prop({ required: true }) public readonly tagNo!: string;

    public form = {
        heartRate: 0x70,
        channel: 0x01
    };

    public submit() {
        console.log(this.form);
    }
}
</script>