<template>
    <el-container>
        <el-header style="padding: 0">
            <Header></Header>
        </el-header>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Header from '../components/Header.vue';

@Component({
    components: {
        Header
    }
})
export default class Index extends Vue {}
</script>

<style lang="postcss" module>
</style>
