<template>
    <div
        style="transform-origin: 0 0"
        :style="{ width: width + 'px', transform: `scale(${scale})` }"
    >
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

const DEFAULT_WIDTH: number = 1600;

@Component
export default class App extends Vue {
    public width: number = DEFAULT_WIDTH;
    public scale: number = 1;

    public mounted() {
        this.scaleRoot();
        window.addEventListener('resize', this.scaleRoot.bind(this), false);
    }

    public scaleRoot() {
        const rootWidth = document.body.clientWidth;
        this.width = DEFAULT_WIDTH;
        if (rootWidth < 768) {
            this.width = 768;
        }

        this.scale = document.body.clientWidth / this.width;
    }
}
</script>

