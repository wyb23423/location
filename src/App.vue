<template>
    <div ref="root">
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { DEFAULT_WIDTH, SX_WIDTH } from './constant';

@Component
export default class App extends Vue {
    // private timer?: number;
    // public mounted() {
    //     this.scaleRoot();
    //     window.addEventListener('resize', this.scaleRoot.bind(this), false);
    // }
    // private scaleRoot() {
    //     if (!this.timer) {
    //         this.timer = setTimeout(() => {
    //             const rootWidth = document.body.clientWidth;
    //             const width = rootWidth <= SX_WIDTH ? SX_WIDTH : DEFAULT_WIDTH;
    //             this.$store.commit('setRootScale', rootWidth / width);
    //             // this.setBodyHeight();
    //         }, 300);
    //     }
    // }
}
</script>

<style lang="postcss" module>
.root {
    transition: all 0.5s ease-out;
    transform-origin: 0 0;
}
</style>
