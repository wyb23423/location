<template>
    <div
        ref="root"
        style="transform-origin: 0 0"
        :style="{
            width: width + 'px',
            transform: `scale(${scale})`
        }"
    >
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

const DEFAULT_WIDTH: number = 1600;
export const SX_WIDTH: number = 768;

@Component
export default class App extends Vue {
    public width: number = DEFAULT_WIDTH;
    public scale: number = 1;

    private timer: any = null;

    public mounted() {
        this.scaleRoot();
        window.addEventListener('resize', this.scaleRoot.bind(this), false);
    }

    private scaleRoot() {
        if (!this.timer) {
            this.timer = setTimeout(() => {
                const rootWidth = document.body.clientWidth;
                this.width = DEFAULT_WIDTH;
                if (rootWidth <= SX_WIDTH) {
                    this.width = SX_WIDTH;
                }
                this.scale = document.body.clientWidth / this.width;
                this.$store.commit('setRootScale', this.scale);

                this.setBodyHeight();
            }, 300);
        }
    }

    private setBodyHeight() {
        const root = <HTMLElement>this.$refs.root;
        const setHeight = () => {
            if (root && root.offsetHeight) {
                document.body.style.height =
                    root.offsetHeight * this.scale + 'px';

                this.timer = null;
            } else {
                requestAnimationFrame(setHeight);
            }
        };

        setHeight();
    }
}
</script>

