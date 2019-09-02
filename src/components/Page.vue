<template>
    <div @click="isMini && (display = false)">
        <div class="main">
            <div :style="{ height: mainHeight }" style="overflow-y: auto">
                <router-view v-if="hasRouter" />
                <slot></slot>
            </div>
        </div>
        <app-aside
            :tabs="tabs"
            :style="{ left: display ? '0' : '-65px' }"
            :class="$style.aside"
        ></app-aside>
        <el-button
            @click.stop="display = !display"
            :class="$style.btn"
            v-if="isMini"
            :icon="`el-icon-caret-${display ? 'left' : 'right'}`"
            :style="{ left: display ? '45px' : '-20px' }"
            type="success"
            circle
            plain
        >
        </el-button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Aside, { TabItem } from './Aside.vue';
import { SX_WIDTH } from '@/constant';
import { Getter } from 'vuex-class';
import { Prop } from 'vue-property-decorator';

@Component({
    components: {
        'app-aside': Aside
    }
})
export default class Page extends Vue {
    @Getter('mainHeight') public readonly mainHeight!: string;
    @Prop() public readonly tabs!: TabItem[];
    @Prop({ default: () => true }) public readonly hasRouter!: boolean;

    public display: boolean = true;
    public isMini: boolean = false;

    private removeListener?: () => void;

    public created() {
        this.resize();

        const resize = this.resize.bind(this);
        window.addEventListener('resize', resize, false);

        this.removeListener = () => {
            window.removeEventListener('resize', resize, false);
        };
    }

    public destroyed() {
        this.removeListener && this.removeListener();
    }

    private resize() {
        this.isMini = document.body.offsetWidth <= SX_WIDTH;
        this.display = !this.isMini;
    }
}
</script>

<style lang="postcss" module>
.aside {
    position: absolute;
    top: 60px;
    z-index: 9999;
    transition: left 300ms ease-out;
}
.btn {
    position: absolute;
    transform: translateY(-50%);
    top: 50%;
    z-index: 99999;
    transition: left 300ms ease-out;
}
</style>
