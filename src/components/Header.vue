<template>
    <el-row
        type="flex"
        justify="space-around"
        align="middle"
        :class="$style.row"
    >
        <el-col :sm="2" :xs="3" :offset="1">
            <router-link to="/index" :class="$style.link">LOGO</router-link>
        </el-col>
        <el-col :sm="19" :xs="0" :class="$style['hidden-xs-only']">
            <el-menu
                mode="horizontal"
                background-color="#393d49"
                text-color="#fff"
                active-text-color="#ffd04b"
                :default-active="activeIndex"
                :router="true"
                v-if="!!tabs.length"
            >
                <el-menu-item v-for="v of tabs" :key="v[1]" :index="v[1]">
                    {{ v[0] }}
                </el-menu-item>
                <el-submenu v-if="!!more.length" index="-2">
                    <template slot="title">
                        更多
                    </template>
                    <el-menu-item v-for="v of more" :key="v[1]" :index="v[1]">
                        {{ v[0] }}
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </el-col>
        <!-- <el-col :span="2" :class="$style['hidden-xs-only']">
            <i
                class="el-icon-s-custom"
                style="color: rgba(255, 255, 255, 0.7)"
            ></i>
            <router-link to="/" :class="$style.link">个人中心</router-link>
        </el-col> -->
        <el-col :offset="1" :span="2" :class="$style['hidden-xs-only']">
            <span :class="$style.link" @click="loginout">退出</span>
        </el-col>

        <el-col
            :span="1"
            :class="$style['hidden-sm-and-up']"
            style="flex-grow: 1"
        ></el-col>
        <el-col :class="$style['hidden-sm-and-up']" style="width: auto">
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
                    <el-menu-item @click="loginout">退出</el-menu-item>
                </el-submenu>
            </el-menu>
        </el-col>
    </el-row>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import Router from 'vue-router';
import { SX_WIDTH } from '../constant';

@Component
export default class Header extends Vue {
    public activeIndex: string = '/index';

    public tabs: string[][] = [];
    public more: string[][] = [];

    public created() {
        this.modifyActiveIndex();
        this.setNavItems();
        window.addEventListener('resize', this.setNavItems.bind(this));
    }

    public loginout() {
        this.$http
            .post('/api/admin/logout')
            .then(() => {
                sessionStorage.removeItem('login');
                location.href = '/login';
            })
            .catch(console.log);
    }

    @Watch('$route', { deep: true })
    public modifyActiveIndex() {
        this.activeIndex = '/' + (this.$route.path.split('/')[1] || 'index');
    }

    private setNavItems() {
        const navItems = [
            ['首页', '/index'],
            ['管理员设置', '/admin'],
            ['系统设置', '/system'],
            ['设备管理', '/base'],
            ['标签管理', '/people'],
            ['实时监控', '/monitor'],
            ['报警信息', '/alarm'],
            ['数据图表', '/chart']
        ].filter(v => this.$router.resolve(v[1]).resolved.name !== '404');

        const rootWidth = document.body.offsetWidth;
        if (rootWidth <= 996 && rootWidth > SX_WIDTH) {
            this.more = navItems.slice(5);
            this.tabs = navItems.slice(0, 5);
        } else {
            this.more.length = 0;
            this.tabs = navItems;
        }
    }
}
</script>

<style lang="postcss" module>
.row {
    background: #393d49;
    height: 100%;
}

.link {
    color: color(#fff alpha(70%));
    text-decoration: none;
    cursor: pointer;

    &:hover {
        color: #fff;
        text-decoration: underline;
    }
}

.hidden-xs-only {
    text-align: center;

    @media (width <= 768px) {
        display: none;
    }
}

@media (width >= 769px) {
    .hidden-sm-and-up {
        display: none;
    }
}
</style>