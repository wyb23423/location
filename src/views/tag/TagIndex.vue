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
export default class TagIndex extends Vue {
    public tabs = [
        {
            title: '标签列表',
            to: 'list',
            icon: 'el-icon-user',
            children: [
                {
                    title: '常驻标签',
                    to: '/tag/list/1',
                    icon: 'el-icon-user-solid'
                },
                {
                    title: '临时标签',
                    to: '/tag/list/2',
                    icon: 'el-icon-s-custom'
                }
            ]
        },
        {
            title: '标签添加',
            to: '/tag/add',
            icon: 'el-icon-document-add'
        },
        {
            title: '标签权限',
            to: '/tag/tagzone',
            icon: 'el-icon-s-check'
        }
    ];
}
</script>