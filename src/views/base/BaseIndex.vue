<template src="../../components/page.html"></template>

<script lang="ts">
import Component from 'vue-class-component';
import Aside from '../../components/Aside.vue';
import { Getter } from 'vuex-class/lib/bindings';
import Vue from 'vue';

@Component({
    components: {
        'app-aside': Aside
    }
})
export default class BaseIndex extends Vue {
    @Getter('mainHeight') public mainHeight!: string;

    public tabs = [
        { title: '设备信息', to: '/base/info', icon: 'el-icon-info' },
        {
            title: '设备添加',
            to: '/base/add',
            icon: 'el-icon-circle-plus-outline'
        },
        {
            title: '校准值配置',
            to: '/base/calibration',
            icon: 'el-icon-setting'
        }
    ];
}
</script>