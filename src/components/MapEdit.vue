<template>
    <el-form label-width="auto" :model="form" ref="form" :rules="rules">
        <el-form-item label="地图名称" prop="name">
            <el-input
                v-model="form.name"
                style="width: 50%"
                placeholder="请输入地图名称"
            ></el-input>
        </el-form-item>
        <el-form-item
            v-for="k of ['minX', 'maxX', 'minY', 'maxY']"
            :key="k"
            :label="k"
            :prop="k"
        >
            <el-input-number :step="100" v-model="form[k]"></el-input-number>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';

@Component
export default class MapEdit extends Vue {
    @Prop() public data?: IJson;

    public form: IJson = {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0
    };

    public rules: IJson = {};

    public created() {
        if (this.data) {
            Object.assign(this.form, this.data);
        }

        this.rules.name = { required: true };
        this.rules.minX = this.rules.minY = this.rules.maxX = this.rules.maxY = {
            required: true,
            min: 0,
            type: 'number'
        };
    }
}
</script>

<style lang="postcss" module>
</style>
