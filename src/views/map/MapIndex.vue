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
export default class MapIndex extends Vue {
    public tabs = [
        { title: '实时监控', to: '/monitor', icon: 'el-icon-view' },
        {
            title: '历史轨迹',
            to: '/monitor/history',
            icon: 'el-icon-film'
        },
        {
            title: '地图编辑',
            to: '/monitor/edit',
            icon: 'el-icon-edit'
        },
        {
            title: '地图添加',
            to: '/monitor/add',
            icon: 'el-icon-document-add'
        }
    ];
}
</script>