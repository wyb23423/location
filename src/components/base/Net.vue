<template>
    <el-form
        ref="form"
        :model="form"
        label-width="100px"
        style="padding-right: 20%"
    >
        <el-form-item label="基站IP">
            <ip-input v-model="form.baseIp"></ip-input>
        </el-form-item>
        <el-form-item label="基站MASK">
            <el-input v-model="form.mask"></el-input>
        </el-form-item>
        <el-form-item label="基站MAC">
            <el-input v-model="form.mac"></el-input>
        </el-form-item>
        <el-form-item label="基站端口">
            <el-input v-model="form.basePort"></el-input>
        </el-form-item>
        <el-form-item label="服务器IP">
            <ip-input v-model="form.serverIp"></ip-input>
        </el-form-item>
        <el-form-item label="服务器端口">
            <el-input v-model="form.serverPort"></el-input>
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
import IpInput from '../../components/IpInput.vue';

@Component({
    components: {
        'ip-input': IpInput
    }
})
export default class Net extends Vue {
    public form: any = {
        baseIp: [],
        serverIp: []
    };

    public onSubmit() {
        //
    }
}
</script>

