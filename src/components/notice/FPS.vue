<template>
    <div :class="$style['fps-box']">FPS: {{ fps }}</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class FPS extends Vue {
    public fps = 60;

    public created() {
        let frame = 0;
        let lastTime = Date.now();

        const loop = () => {
            const now = Date.now();
            frame++;

            if (now > 1000 + lastTime) {
                this.fps = Math.min(
                    60,
                    Math.round((frame * 1000) / (now - lastTime))
                );
                frame = 0;
                lastTime = now;
            }

            requestAnimationFrame(loop);
        };

        loop();
    }
}
</script>


<style lang="postcss" module>
.fps-box {
    background: #fff;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99999999;
    padding: 10px;
}
</style>
