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
export default class MapIndex extends Vue {
    @Getter('mainHeight') public mainHeight!: string;

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