<template>
    <app-page :tabs="tabs"></app-page>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import Page from '@/components/Page.vue';

@Component({
    components: {
        'app-page': Page
    }
})
export default class System extends Vue {
    public tabs = [
        { title: '电子围栏', to: '/system/fence', icon: 'el-icon-crop' },
        { title: '标签绑定', to: '/system/bind', icon: 'el-icon-connection' },
        // { title: '基站配置', to: '/system/base', icon: 'el-icon-setting' },
        {
            title: '摄像头',
            to: 'camera',
            icon: 'el-icon-video-camera',
            children: [
                {
                    title: '摄像头添加',
                    to: '/system/camera/add',
                    icon: 'el-icon-circle-plus-outline'
                },
                {
                    title: '摄像头列表',
                    to: '/system/camera/list',
                    icon: 'el-icon-tickets'
                }
            ]
        },
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
        }
    ];
}
</script>