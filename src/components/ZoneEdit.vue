<template>
    <el-form
        :model="zone"
        label-width="90px"
        style="overflow: auto;"
        :style="{ 'max-height': formHeight }"
    >
        <el-form-item label="区域名称" required>
            <el-input v-model="zone.name" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="区域模式">
            <el-select v-model="zone.mode" placeholder="请选择">
                <el-option label="进入区域" :value="zoneMode.in"></el-option>
                <el-option label="离开区域" :value="zoneMode.out"></el-option>
                <el-option
                    label="切换区域"
                    :value="zoneMode.switch"
                    v-if="groups.length >= 2"
                ></el-option>
                <el-option label="分组区域" :value="zoneMode.group"></el-option>
                <el-option label="其他" :value="zoneMode.other"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item
            label="相关分组"
            required
            v-if="zone.mode === zoneMode.group"
        >
            <el-select v-model="zone.groupNo1">
                <el-option v-for="v of groups" :key="v" :value="v"></el-option>
            </el-select>
        </el-form-item>
        <template v-if="zone.mode === zoneMode.switch">
            <el-form-item label="基站分组1" required>
                <el-select v-model="zone.groupNo1">
                    <el-option
                        v-for="v of groups"
                        :key="v"
                        :value="v"
                        :disabled="v === zone.groupNo2"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="基站分组2" required>
                <el-select v-model="zone.groupNo2">
                    <el-option
                        v-for="v of groups"
                        :key="v"
                        :value="v"
                        :disabled="v === zone.groupNo1"
                    ></el-option>
                </el-select>
            </el-form-item>
        </template>
        <slot></slot>
        <el-form-item label="启动">
            <el-switch
                v-model="zone.open"
                active-text="true"
                inactive-text="false"
            >
            </el-switch>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch, Model, Emit } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { State } from 'vuex-class/lib/bindings';
import { ZoneMode } from '@/store';

@Component
export default class ZoneEidt extends Vue {
    @State public readonly zoneMode!: ZoneMode;

    @Prop({ default: () => 'none' }) public readonly formHeight!: string;
    @Prop() public readonly groups!: string[];
    @Model('change') public readonly value!: IZone;

    public zone: IZone = <IZone>{};

    public created() {
        if (!this.value) {
            console.error('组件缺少v-model绑定!');
        }

        this.zone = this.value || {};
    }

    @Watch('value', { deep: true })
    public getVlaue(val: IZone) {
        this.zone = val;
    }

    @Emit('change')
    @Watch('zone', { deep: true })
    public setValue(val: IZone) {
        //
    }
}
</script>
