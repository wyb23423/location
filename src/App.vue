<template>
    <div ref="root">
        <router-view />
        <app-notice></app-notice>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { DEFAULT_WIDTH, SX_WIDTH } from './constant';
import Notice from './components/Notice.vue';

@Component({
    components: {
        'app-notice': Notice
    }
})
export default class App extends Vue {
    //
}
</script>

<style lang="postcss" module>
.root {
    transition: all 0.5s ease-out;
    transform-origin: 0 0;
}
</style>
