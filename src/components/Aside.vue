<template>
    <div :class="$style.aside" :style="{ height }">
        <el-tooltip
            class="item"
            effect="dark"
            :content="isCollapse ? '展开' : '收起'"
            placement="right"
        >
            <div :class="$style.icon" @click="collapse">
                <i class="el-icon-menu"></i>
            </div>
        </el-tooltip>
        <el-menu
            background-color="#393d49"
            text-color="#fff"
            active-text-color="#ffd04b"
            :default-active="defaultActive"
            :router="true"
            :unique-opened="true"
            :collapse="isCollapse"
            @click="collapse"
            style="text-align: center"
        >
            <template v-for="(v, i) of tabs">
                <el-menu-item :key="v.to" :index="v.to" v-if="!v.children">
                    <i :class="v.icon || 'el-icon-paperclip'"></i>
                    <span slot="title">{{ v.title }}</span>
                </el-menu-item>
                <el-submenu :index="i + ''" :key="v.to" v-else>
                    <template slot="title">
                        <i :class="v.icon || 'el-icon-paperclip'"></i>
                        <span slot="title">{{ v.title }}</span>
                    </template>
                    <el-menu-item
                        v-for="item of v.children"
                        :key="item.to"
                        :index="item.to"
                    >
                        <i :class="item.icon" v-if="!item.icon"></i>
                        {{ item.title }}
                    </el-menu-item>
                </el-submenu>
            </template>
        </el-menu>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { SX_WIDTH } from '../App.vue';
import { Getter } from 'vuex-class/lib/bindings';

interface TabItem {
    title: string;
    to: string;
    icon?: string;
    children?: TabItem[];
}

@Component
export default class Aside extends Vue {
    public defaultActive: string = '';
    public isCollapse: boolean = true;

    @Getter('mainHeight') public height?: string;

    @Prop() public tabs?: TabItem[];

    public created() {
        this.modifyActiveIndex();
    }

    public collapse() {
        this.isCollapse = !this.isCollapse;
    }

    @Watch('$route', { deep: true })
    public modifyActiveIndex() {
        this.defaultActive = this.$route.path;
        const tabs: TabItem[] = this.tabs || [];
        if (tabs.every(v => v.to !== this.defaultActive)) {
            this.defaultActive = tabs[0].to;
        }
    }
}
</script>

<style lang="postcss" module>
.aside {
    background: #393d49;
    position: absolute;
    top: 60px;
    left: 0;
}
.icon {
    color: #fff;
    cursor: pointer;
    text-align: center;
    border-right: solid 1px #e6e6e6;
    padding: 10px 0;
    background: #393d49;

    &:hover {
        background: rgb(46, 49, 58);
    }
}
</style>


