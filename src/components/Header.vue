<template>
    <el-row
        type="flex"
        justify="space-around"
        align="middle"
        style="background: #393d49;"
    >
        <el-col :sm="2" :xs="3" :class="$style.link" :offset="1">
            LOGO
        </el-col>
        <el-col :sm="19" :xs="0">
            <el-menu
                mode="horizontal"
                background-color="#393d49"
                text-color="#fff"
                active-text-color="#ffd04b"
                :unique-opened="true"
                :router="true"
                :default-active="activeIndex"
            >
                <el-menu-item v-for="(v, i) of tabs" :key="i" :index="i + ''">
                    {{ v }}
                </el-menu-item>
            </el-menu>
        </el-col>
        <el-col :sm="2" :xs="0">
            <i
                class="el-icon-s-custom"
                style="color: rgba(255, 255, 255, 0.7)"
            ></i>
            <router-link to="/" :class="$style.link">个人中心</router-link>
        </el-col>
        <el-col :sm="1" :xs="0">
            <span :class="$style.link">退出</span>
        </el-col>

        <el-col :sm="0" :xs="19"></el-col>
        <el-col :sm="0" :xs="2">
            <el-menu
                background-color="#393d49"
                text-color="#fff"
                active-text-color="#ffd04b"
                :unique-opened="true"
                :router="true"
                :default-active="activeIndex"
                :collapse="true"
            >
                <el-submenu index="-1">
                    <template slot="title">
                        <i class="el-icon-menu"></i
                    ></template>
                    <el-menu-item
                        v-for="(v, i) of tabs"
                        :key="i"
                        :index="i + ''"
                    >
                        {{ v }}
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </el-col>
    </el-row>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Header extends Vue {
    public activeIndex: string = '0';
    public tabs: string[] = [
        '首页',
        '管理员设置',
        '系统设置',
        '设备管理',
        '人员管理',
        '实时监控',
        '电子围栏',
        '报警信息'
    ];
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
</style>