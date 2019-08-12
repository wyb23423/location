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
export default class PeopleIndex extends Vue {
    @Getter('mainHeight') public mainHeight!: string;

    public tabs = [
        {
            title: '标签列表',
            to: 'list',
            icon: 'el-icon-user',
            children: [
                {
                    title: '常驻标签',
                    to: '/people/list/1',
                    icon: 'el-icon-user-solid'
                },
                {
                    title: '临时标签',
                    to: '/people/list/2',
                    icon: 'el-icon-s-custom'
                }
            ]
        },
        {
            title: '标签添加',
            to: '/people/add',
            icon: 'el-icon-document-add'
        }
    ];
}
</script>