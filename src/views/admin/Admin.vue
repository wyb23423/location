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
export default class Admin extends Vue {
    @Getter('mainHeight') public mainHeight?: string;

    public tabs = [
        { title: '管理员', to: '/admin/list', icon: 'el-icon-user' },
        {
            title: '增加人员',
            to: '/admin/add',
            icon: 'el-icon-circle-plus-outline'
        },
        { title: '权限管理', to: '/admin/chown ', icon: 'el-icon-s-operation' }
    ];
}
</script>