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
export default class System extends Vue {
    public tabs = [
        {
            title: '地图管理',
            to: 'map',
            icon: 'el-icon-ali-Mapicon',
            children: [
                {
                    title: '地图编辑',
                    to: '/system/map/edit',
                    icon: 'el-icon-edit'
                },
                {
                    title: '地图添加',
                    to: '/system/map/add',
                    icon: 'el-icon-document-add'
                }
            ]
        },
        {
            title: '分组管理',
            to: 'group',
            icon: 'el-icon-folder',
            children: [
                {
                    title: '分组列表',
                    to: '/system/group/list',
                    icon: 'el-icon-folder-opened'
                },
                {
                    title: '分组添加',
                    to: '/system/group/add',
                    icon: 'el-icon-folder-add'
                }
            ]
        },
        { title: '区域', to: '/system/zone', icon: 'el-icon-crop' },
        {
            title: '协议',
            to: 'protocol',
            icon: 'el-icon-document',
            children: [
                {
                    title: '协议添加',
                    to: '/system/protocol/add',
                    icon: 'el-icon-document-add'
                },
                {
                    title: '协议列表',
                    to: '/system/protocol/list',
                    icon: 'el-icon-document-copy'
                },
                {
                    title: '下发协议',
                    to: '/system/protocol/submissio',
                    icon: 'el-icon-takeaway-box'
                }
            ]
        },
        {
            title: '校准值配置',
            to: '/system/calibration',
            icon: 'el-icon-setting'
        },
        {
            title: '基站二维码',
            to: '/system/qrcode',
            icon: 'el-icon-ali-icon26801'
        }
    ];
}
</script>