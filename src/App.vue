<template>
    <div ref="root">
        <router-view />
        <app-notice></app-notice>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { DEFAULT_WIDTH, SX_WIDTH, RESIZE, NOTIFY_KEY } from './constant';
import Notice from './components/Notice.vue';

@Component({
    components: {
        'app-notice': Notice
    }
})
export default class App extends Vue {
    public created() {
        let timer: number;
        const fn = () => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                this.$event.emit(RESIZE);
                this.$store.commit('rootWidth', document.body.offsetWidth);
            }, 200);
        };

        window.addEventListener('resize', fn, false);
        fn();

        setTimeout(() => {
            for (let i = 0; i < 10000; i++) {
                this.$event.emit(NOTIFY_KEY, {
                    tagNo: '00001',
                    alarmTime: Date.now(),
                    alarmMsg: 'test' + i
                });
            }
        }, 1000);
    }
}
</script>

<style lang="postcss" module>
.root {
    transition: all 0.5s ease-out;
    transform-origin: 0 0;
}
</style>
