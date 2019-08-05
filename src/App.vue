<template>
    <div ref="root">
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class App extends Vue {}
</script>

<style lang="postcss" module>
.root {
    transition: all 0.5s ease-out;
    transform-origin: 0 0;
}
</style>
