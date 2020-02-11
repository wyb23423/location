<template>
    <iframe
        :class="$style.iframe"
        :src="target"
        @load="postMsg"
        ref="charts"
    ></iframe>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { getConfig } from '@/assets/utils/util';
import { Ref } from 'vue-property-decorator';

const CHARTS_TARGET = getConfig(
    'CHARTS_TARGET',
    'http://127.0.0.1:3000'
).replace(/\/+$/, '');

@Component
export default class Charts extends Vue {
    public target = CHARTS_TARGET + '/fields';

    @Ref('charts') private readonly iFrame!: HTMLIFrameElement;

    public created() {
        this.fitLocalhost();
    }

    public postMsg() {
        this.iFrame.contentWindow?.postMessage(
            sessionStorage.getItem('login'),
            this.target
        );
    }

    private fitLocalhost() {
        const hostname = location.hostname;
        if (this.isLocalhost(hostname)) {
            const url = new URL(this.target);
            const targetName = url.hostname;
            if (this.isLocalhost(targetName) && targetName !== hostname) {
                url.hostname = hostname;
                this.target = url.toJSON();
            }
        }
    }

    private isLocalhost(hostname: string) {
        return hostname === 'localhost' || hostname === '127.0.0.1';
    }
}
</script>

<style lang="postcss" module>
.iframe {
    width: 100%;
    height: 99%;
    border: none;
    overflow: auto;
}
</style>