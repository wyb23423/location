<template>
    <el-form
        ref="form"
        :model="form"
        label-width="100px"
        style="padding-right: 20%"
    >
        <el-form-item label="所属组号">
            <el-input v-model="form.groupCode"></el-input>
        </el-form-item>
        <el-form-item label="基站标示">
            <el-radio-group v-model="form.main">
                <el-radio :label="0">从基站</el-radio>
                <el-radio :label="1">主基站</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="距离参数">
            <el-input v-model="form.distance"></el-input>
        </el-form-item>
        <el-form-item label="时间参数">
            <el-input v-model="form.time"></el-input>
        </el-form-item>
        <el-form-item label="功率等级">
            <el-input v-model="form.power"></el-input>
        </el-form-item>
        <el-form-item label="基站信道">
            <el-radio-group v-model="form.channel">
                <el-radio :label="2"></el-radio>
                <el-radio :label="5"></el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="频率等级">
            <el-radio-group v-model="form.frequency">
                <el-radio :label="1"></el-radio>
                <el-radio :label="5"></el-radio>
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

@Component
export default class Primary extends Vue {
    public form: any = {};

    public onSubmit() {
        //
    }
}
</script>

