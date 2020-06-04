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
export default class Monitor extends Vue {
    public tabs = [
        { title: '实时监控', to: '/monitor/realTime', icon: 'el-icon-view' },
        {
            title: '历史轨迹',
            to: '/monitor/history',
            icon: 'el-icon-film'
        },
        {
            title: '视频监控',
            to: '/monitor/video',
            icon: 'el-icon-video-camera'
        },
        { title: '标签绑定', to: '/monitor/bind', icon: 'el-icon-connection' },
        {
            title: '报警列表',
            to: '/monitor/alarm',
            icon: 'el-icon-alarm-clock'
        }
    ];
}
</script>