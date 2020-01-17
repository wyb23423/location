<template>
    <div class="map-box" @click="hiddenCover" ref="root">
        <div :class="$style['tool-bar']" class="map-tool-bar flex-center">
            <map-select @selectmap="selectMap"></map-select>
            <TagSelect
                @change="showLineTags = $event"
                placeholder="显示轨迹的标签"
                :multiple="true"
                style="margin: 0 10px"
            ></TagSelect>
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
            </div>
        </div>

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

        <transition name="el-zoom-in-bottom">
            <Census
                v-if="tools[4].active"
                @close="tools[4].active = false"
                :zones="zones | mode(zoneMode.group)"
                :censusTags="census"
                :censusChange="censusChange"
            ></Census>
        </transition>

        <transition name="el-fade-in-linear">
            <Group
                style="opacity: 0.85"
                :group="groupData"
                :groupOp="groupOp"
                v-if="tools[3].active"
            ></Group>
            <Zone
                style="opacity: 0.85"
                :zones="zones"
                :zone-op="zoneOp"
                v-if="tools[2].active"
            ></Zone>
        </transition>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import EventMixin from '@/mixins/event';
import Zone from '@/components/monitor/Zone.vue';
import Group from '@/components/monitor/Group.vue';
import Census from '@/components/monitor/Census.vue';
import TagSelect from '@/components/form/TagSelect.vue';
import MonitorMixin from '@/mixins/monitor';
import { ZoneMode } from '@/store';
import { State } from 'vuex-class/lib/bindings';
import { Ref } from 'vue-property-decorator';
import { Async } from '../../assets/utils/util';
import { GET_ZONE } from '../../constant/request';

@Component({
    components: {
        Zone,
        Group,
        Census,
        TagSelect
    },
    filters: {
        mode(datas: IZone[], mode: number) {
            return datas.filter(v => v.mode === mode);
        }
    }
})
export default class Monitor extends mixins(MonitorMixin, EventMixin) {
    @State public readonly zoneMode!: ZoneMode;

    public groupData: Record<string, IBaseStation[]> = {}; // 基站分组
    public zones: IZone[] = []; // 区域列表

    // 右下工具栏列表
    public tools: ToolItem[] = [
        { name: '2D', active: true, display: true },
        { name: '3D', active: false, display: false },
        { name: '区域列表', active: false, display: true },
        { name: '分组列表', active: false, display: true },
        { name: '统计', active: false, display: true }
    ];
    // public isFullScreen: boolean = false;
    public findTarget: string = ''; // 查询标签的标签号
    public isName: number = 0; // 是否通过标签名查询标签
    public showLineTags: string[] = []; // 显示轨迹的标签号
    public zoneOp = [
        {
            type: { default: 'primary' },
            name: 'display',
            desc: { default: '显示' }
        }
    ];
    public groupOp = [
        {
            type: { default: 'primary' },
            name: 'display',
            desc: { default: '隐藏' }
        }
    ];

    @Ref('root') private readonly root!: HTMLDivElement;

    public get census() {
        // ===========================触发响应
        const x = this.censusChange;
        console.log(x);
        // =============================

        return this.censusTags;
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

    protected showLine(tagNo: string) {
        return this.showLineTags.includes(tagNo);
    }

    @Async()
    protected async afterMapCreated() {
        this.tools[1].display = !!this.mgr && this.mgr.has3D;

        const res = await this.$http.get(GET_ZONE, {
            currentPage: 1,
            pageSize: 1_0000_0000
        });
        this.zones = res.pagedData.datas.filter(
            (v: IZone) => v.mapId === this.mapId
        );
    }

    // 基站相关数据初始化
    protected initBases(data: IBaseStation[]) {
        this.groupData = data.reduce((groupData, v) => {
            (groupData[v.groupId] || (groupData[v.groupId] = [])).push(v);
            return groupData;
        }, <Record<string, IBaseStation[]>>{});
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
