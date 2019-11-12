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
export default class ChartIndex extends Vue {
    public tabs = [
        {
            title: '热力图',
            to: '/chart/heatmap',
            icon: 'el-icon-c-scale-to-original'
        }
    ];
}
</script>