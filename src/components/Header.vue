<template>
    <el-row
        type="flex"
        justify="space-around"
        align="middle"
        style="background: #393d49;height: 100%"
    >
        <el-col :sm="2" :xs="3" :class="$style.link" :offset="1">
            LOGO
        </el-col>
        <el-col :sm="19" :xs="0" :class="$style['hidden-xs-only']">
            <el-menu
                mode="horizontal"
                background-color="#393d49"
                text-color="#fff"
                active-text-color="#ffd04b"
                :default-active="activeIndex"
                :router="true"
            >
                <el-menu-item v-for="v of tabs" :key="v[1]" :index="v[1]">
                    {{ v[0] }}
                </el-menu-item>
            </el-menu>
        </el-col>
        <el-col :span="2" :class="$style['hidden-xs-only']">
            <i
                class="el-icon-s-custom"
                style="color: rgba(255, 255, 255, 0.7)"
            ></i>
            <router-link to="/" :class="$style.link">个人中心</router-link>
        </el-col>
        <el-col :span="1" :class="$style['hidden-xs-only']">
            <span :class="$style.link">退出</span>
        </el-col>

        <el-col :span="19" :class="$style['hidden-sm-and-up']"></el-col>
        <el-col :span="2" :class="$style['hidden-sm-and-up']">
            <el-menu
                background-color="#393d49"
                text-color="#fff"
                active-text-color="#ffd04b"
                :default-active="activeIndex"
                :router="true"
                :collapse="true"
            >
                <el-submenu index="-1">
                    <template slot="title">
                        <i class="el-icon-menu"></i>
                    </template>
                    <el-menu-item v-for="v of tabs" :key="v[1]" :index="v[1]">
                        {{ v[0] }}
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </el-col>
    </el-row>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';

@Component
export default class Header extends Vue {
    public activeIndex: string = '/index';

    public tabs: string[][] = [
        ['首页', '/index'],
        ['管理员设置', '/admin'],
        ['系统设置', '/system'],
        ['设备管理', '/equipment'],
        ['人员管理', '/person'],
        ['实时监控', '/monitor'],
        ['电子围栏', '/fence'],
        ['报警信息', '/alarm']
    ];

    public created() {
        this.modifyActiveIndex();
    }

    @Watch('$route', { deep: true })
    public modifyActiveIndex() {
        this.activeIndex = '/' + (this.$route.path.split('/')[1] || 'index');
    }
}
</script>

<style lang="postcss" module>
.link {
    color: color(#fff alpha(70%));
    text-decoration: none;
    cursor: pointer;

    &:hover {
        color: #fff;
        text-decoration: underline;
    }
}

@media (width <= 768px) {
    .hidden-xs-only {
        display: none;
    }
}

@media (width >= 769px) {
    .hidden-sm-and-up {
        display: none;
    }
}
</style>