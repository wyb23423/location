<template>
    <el-container>
        <el-header style="padding: 0">
            <app-nav></app-nav>
        </el-header>
        <el-main style="padding: 0">
            <router-view />
        </el-main>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Header from '../components/Header.vue';
import { Prop } from 'vue-property-decorator';

@Component({
    components: {
        'app-nav': Header
    }
})
export default class Main extends Vue {}
</script>
