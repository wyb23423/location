<template>
    <div class="map-box" @click="hiddenCover" ref="root">
        <div :class="$style['tool-bar']" class="map-tool-bar flex-center">
            <map-select @selectmap="selectMap"></map-select>
            <div class="flex-center">
                <el-input
                    :placeholder="`请输入${isName ? '标签名' : '标签号'}`"
                    type="search"
                    v-model="findTarget"
                    style="max-width: 350px; margin-right: 10px"
                    @keyup.enter.native="find"
                >
                    <el-select
                        slot="prepend"
                        v-model="isName"
                        style="width: 100px"
                        :popper-append-to-body="false"
                    >
                        <el-option :value="0" label="标签号"></el-option>
                        <el-option :value="1" label="标签名"></el-option>
                    </el-select>
                </el-input>
                <el-button
                    :icon="
                        isFullScreen
                            ? 'el-icon-ali-tuichuquanping'
                            : 'el-icon-full-screen'
                    "
                    @click="fullScreen"
                ></el-button>
            </div>
        </div>
        <el-switch
            v-model="showPath"
            active-text="显示轨迹"
            inactive-text="隐藏轨迹"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :class="$style.switch"
        ></el-switch>

        <div ref="map" style="height: 100%; overflow: hidden"></div>
        <div :class="$style.tools">
            <el-button
                v-for="(v, i) of tools"
                :key="i"
                :type="v.active ? 'primary' : ''"
                :class="$style['tool-item']"
                @click.stop="swithDisplay(i)"
                v-show="v.display"
            >
                {{ v.name }}
            </el-button>
        </div>

        <!-- <transition name="el-zoom-in-bottom">
            <Census
                v-if="tools[4].active"
                @close="tools[4].active = false"
                :zones="zones | filterZone(zoneMode.group)"
                :censusTags="census"
                :censusChange="censusChange"
            ></Census>
        </transition> -->

        <transition name="el-fade-in-linear">
            <Group :group="groupData" v-if="tools[3].active"></Group>
            <Zone :zones="zones" v-if="tools[2].active"></Zone>
        </transition>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '@/mixins/table';
import EventMixin from '@/mixins/event';

import Zone from '@/components/monitor/Zone.vue';
import Group from '@/components/monitor/Group.vue';
import Census from '@/components/monitor/Census.vue';
import MonitorMixin from '@/mixins/monitor';
import { ZoneMode } from '@/store';
import { State } from 'vuex-class/lib/bindings';
import { Ref, Watch } from 'vue-property-decorator';
import { PIXIMgr } from '@/assets/map/pixi';
import { RESIZE } from '@/constant';

@Component({
    components: {
        Zone,
        Group,
        Census
    },
    filters: {
        filterZone(zones: IZone[], mode: number) {
            return zones.filter(v => v.mode === mode);
        }
    }
})
export default class Monitor extends mixins(
    MonitorMixin,
    TableMixin,
    EventMixin
) {
    @State public readonly zoneMode!: ZoneMode;

    public groupData: { [x: string]: IBaseStation[] } = {}; // 基站分组
    public zones: IZone[] = []; // 区域列表

    // 右下工具栏列表
    public tools: ToolItem[] = [
        { name: '2D', active: true, display: true },
        { name: '3D', active: false, display: false },
        { name: '区域列表', active: false, display: true },
        { name: '分组列表', active: false, display: true },
        { name: '统计', active: false, display: true }
    ];
    public isFullScreen: boolean = false;
    public findTarget: string = ''; // 查询标签的标签号
    public isName: number = 0; // 是否通过标签名查询标签

    public censusChange: number = 0; // 用于触发响应（当前vue版本不支持Map及Set的数据响应）
    private censusTags = new Map<string, Set<string>>(); // 分组统计
    private tagGroup = new Map<string, string>(); // tag-group映射

    @Ref('root') private readonly root!: HTMLDivElement;

    public get census() {
        // ===========================触发响应
        const x = this.censusChange;
        console.log(x);
        // =============================

        return this.censusTags;
    }

    public created() {
        this.on(RESIZE, () => {
            this.isFullScreen = !!document.fullscreenElement;

            if (this.container && this.mgr instanceof PIXIMgr) {
                this.mgr.map.resize(
                    this.container.offsetWidth,
                    this.container.offsetHeight
                );
            }
        });
    }

    // ==================================dom事件
    // 切换弹窗的显示
    public swithDisplay(i: number) {
        const toolItem = this.tools[i];
        if (i < 2) {
            if (toolItem.active) {
                return;
            }

            const otherMode = this.tools[i ? 0 : 1];
            otherMode.active = !otherMode.active;

            if (this.mgr) {
                this.mgr.switchViewMode(
                    i ? fengmap.FMViewMode.MODE_3D : fengmap.FMViewMode.MODE_2D
                );
            }
        }

        toolItem.active = !toolItem.active;
        if (i === 2 || i === 3) {
            const other = this.tools[i === 2 ? 3 : 2];
            if (toolItem.active) {
                other.active = false;
            }
        }
    }

    // 隐藏所有弹窗
    public hiddenCover() {
        for (let i = 2; i < this.tools.length; i++) {
            this.tools[i].active = false;
        }
    }

    // 查询标签
    public find() {
        if (!this.findTarget) {
            return this.$message.warning(
                '请输入' + this.isName ? '标签名' : '标签号'
            );
        }

        this.showInfo(this.findTarget, this.isName);
        this.findTarget = '';
    }

    public fullScreen() {
        document.fullscreenElement
            ? document.exitFullscreen()
            : this.root && this.root.requestFullscreen();
    }
    // ==================================
    protected initData() {
        this.initWebSocket();

        this.tools[0].active = true;
        this.tools[1].active = false;

        this.findTarget = '';
        for (let i = 2; i < this.tools.length; i++) {
            this.tools[i].active = false;
        }
    }

    protected afterMapCreated() {
        this.tools[1].display = !!this.mgr && this.mgr.has3D;

        this.$http
            .get('/api/zone/getall', {
                currentPage: 1,
                pageSize: 1_0000_0000,
                mapId: <number>this.mapId
            })
            .then(res => (this.zones = res.pagedData.datas))
            .catch(() => console.log);
    }

    protected doCensus(tag: ITagInfo | string) {
        // const tagNo = (<ITagInfo>tag).sTagNo || <string>tag;
        // const group = this.tagGroup.get(tagNo);
        // if (group) {
        //     const set = this.censusTags.get(group);
        //     set && set.delete(tagNo);
        // }
        // if (typeof tag !== 'string') {
        //     const set = this.censusTags.get(tag.sGroupNo) || new Set();
        //     set.add(tagNo);
        //     this.censusTags.set(tag.sGroupNo, set);
        //     this.tagGroup.set(tagNo, tag.sGroupNo);
        // }
        // this.censusChange = this.censusChange ? 0 : 1;
    }
}

// ===========================================

interface ToolItem {
    name: string; // 显示文字
    active: boolean; // 是否激活
    display: boolean; // 是否显示
}
</script>

<style lang="postcss" module>
.tool-bar {
    justify-content: space-between;
    padding: 0 5%;
}
.tools {
    position: absolute;
    left: 50px;
    bottom: 50px;
    width: 140px;
    border-radius: 10px;
    /* border: 1px solid #ccc; */
    overflow: hidden;
}
.tool-item {
    width: 100%;
    margin: 0 !important;
    border-radius: 0 !important;
    display: block;
}
.switch {
    position: absolute;
    right: 20px;
    top: 70px;
}
</style>
