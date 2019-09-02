<template>
    <div style="background: #393d49;" :style="{ height }" @click.stop>
        <el-tooltip
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
            style="text-align: center; border-right: none"
        >
            <template v-for="(v, i) of currTabs">
                <el-menu-item :key="v.to" :index="v.to" v-if="!v.children">
                    <i :class="v.icon || 'el-icon-paperclip'"></i>
                    <span slot="title">{{ v.title }}</span>
                </el-menu-item>
                <el-submenu :index="i + ''" :key="v.to" v-else>
                    <div
                        slot="title"
                        :class="{ [$style.active]: v.to === activeTitle }"
                    >
                        <i :class="v.icon || 'el-icon-paperclip'"></i>
                        <span>{{ v.title }}</span>
                    </div>
                    <el-menu-item
                        v-for="item of v.children"
                        :key="item.to"
                        :index="item.to"
                    >
                        <i :class="item.icon" v-if="!!item.icon"></i>
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
import { Getter } from 'vuex-class/lib/bindings';
import Router from 'vue-router';

export interface TabItem {
    title: string;
    to: string;
    icon?: string;
    children?: TabItem[];
}

@Component
export default class Aside extends Vue {
    public defaultActive: string = '';
    public isCollapse: boolean = true;
    public activeTitle: string = '';

    @Getter('mainHeight') public height!: string;
    @Prop() public tabs!: TabItem[];

    public currTabs: TabItem[] = [];

    public created() {
        this.currTabs = this.parseTabs(this.tabs);
        this.modifyActiveIndex();
    }

    public collapse() {
        this.isCollapse = !this.isCollapse;
    }

    @Watch('$route', { deep: true })
    public modifyActiveIndex() {
        this.defaultActive = this.$route.path;
        if (this.$route.path.split('/').length < 3) {
            const tabs: TabItem[] = this.currTabs || [];
            this.defaultActive = this.defaultTo(tabs);
        }

        this.activeTitle = this.defaultActive.split('/')[2];
    }

    private defaultTo(tabs: TabItem[]): string {
        const tab = tabs[0];
        if (tab.children && tab.children.length) {
            return this.defaultTo(tab.children);
        }

        return tab.to;
    }

    private parseTabs(tabs: TabItem[]) {
        const result: TabItem[] = [];
        for (const v of tabs) {
            if (v.children) {
                const children = this.parseTabs(v.children);
                if (children.length) {
                    result.push({ ...v, children });
                }
            } else if (this.$router.resolve(v.to).resolved.name !== '404') {
                result.push(v);
            }
        }

        return result;
    }
}
</script>

<style lang="postcss" module>
.icon {
    color: #fff;
    cursor: pointer;
    text-align: center;
    padding: 10px 0;
    background: #393d49;

    &:hover {
        background: rgb(46, 49, 58);
    }
}
.active,
.active i {
    color: #ffd04b !important;
}
</style>


