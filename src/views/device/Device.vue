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
export default class Device extends Vue {
    public tabs = [
        {
            title: '基站',
            to: 'base',
            icon: 'el-icon-ali-jizhan',
            children: [
                {
                    title: '基站信息',
                    to: '/device/base/info',
                    icon: 'el-icon-info'
                },
                {
                    title: '基站添加',
                    to: '/device/base/add',
                    icon: 'el-icon-circle-plus-outline'
                },
                {
                    title: '分组配置',
                    to: '/device/base/batch',
                    icon: 'el-icon-folder-opened'
                }
            ]
        },
        {
            title: '标签',
            to: 'tag',
            icon: 'el-icon-ali-tags',
            children: [
                {
                    title: '常驻标签',
                    to: '/device/tag/list/1',
                    icon: 'el-icon-user-solid'
                },
                // {
                //     title: '临时标签',
                //     to: '/device/tag/list/2',
                //     icon: 'el-icon-s-custom'
                // },
                {
                    title: '添加标签',
                    to: '/device/tag/add',
                    icon: 'el-icon-plus'
                },
                {
                    title: '导入标签',
                    to: '/device/tag/import',
                    icon: 'el-icon-folder-add'
                },
                {
                    title: '标签权限',
                    to: '/device/tag/tagzone',
                    icon: 'el-icon-s-check'
                }
            ]
        },
        {
            title: '摄像头',
            to: 'camera',
            icon: 'el-icon-video-camera',
            children: [
                {
                    title: '摄像头列表',
                    to: '/device/camera/list',
                    icon: 'el-icon-tickets'
                },
                {
                    title: '摄像头添加',
                    to: '/device/camera/add',
                    icon: 'el-icon-circle-plus-outline'
                }
            ]
        }
    ];
}
</script>