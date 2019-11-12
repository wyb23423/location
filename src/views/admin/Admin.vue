<template>
    <app-page :tabs="tabs"></app-page>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Aside from '../../components/Aside.vue';

import Vue from 'vue';
import Page from '@/components/layout/Page.vue';

@Component({
    components: {
        'app-page': Page
    }
})
export default class Admin extends Vue {
    public tabs = [
        { title: '管理员', to: '/admin/list', icon: 'el-icon-user' },
        {
            title: '增加人员',
            to: '/admin/add',
            icon: 'el-icon-circle-plus-outline'
        }
    ];
}
</script>