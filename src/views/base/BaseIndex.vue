<template>
    <app-page :tabs="tabs"></app-page>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import Page from '@/components/layout/Page.vue';

@Component({
    components: {
        'app-page': Page
    }
})
export default class BaseIndex extends Vue {
    public tabs = [
        { title: '设备信息', to: '/base/info', icon: 'el-icon-info' },
        {
            title: '设备添加',
            to: 'add',
            icon: 'el-icon-circle-plus-outline',
            children: [
                {
                    title: '全部数据',
                    to: '/base/add/all',
                    icon: 'el-icon-circle-plus-outline'
                },
                {
                    title: '基础数据',
                    to: '/base/add/install',
                    icon: 'el-icon-ali-anzhuang'
                }
            ]
        },
        {
            title: '校准值配置',
            to: '/base/calibration',
            icon: 'el-icon-setting'
        },
        {
            title: '分组配置',
            to: '/base/batch',
            icon: 'el-icon-folder-opened'
        }
    ];
}
</script>