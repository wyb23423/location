<template>
    <el-container>
        <el-header style="padding: 0">
            <app-nav></app-nav>
        </el-header>
        <el-main style="padding: 0">
            <router-view />
        </el-main>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Header from '../components/layout/Header.vue';
import { Prop } from 'vue-property-decorator';
import { NOTIFY_KEY, RECOVERY, ALARM_TYPE, MISS } from '@/constant';
import { getIp, getConfig } from '@/assets/utils/util';

@Component({
    components: {
        'app-nav': Header
    }
})
export default class Main extends Vue {
    private readonly delay = 500 / getConfig<number>('SECOND_COUNT', 1);

    public created() {
        this.link();
    }

    public mounted() {
        this.$event.emit(RECOVERY);
    }

    private link() {
        const ip = getIp();
        if (!ip) {
            return;
        }
        const wsUrl = getConfig<string>(
            'websoket.sundries',
            'ws://#{ip}:8081/sundries'
        );
        const ws = new WebSocket(wsUrl.replace('#{ip}', ip));
        ws.onmessage = (e: MessageEvent) => {
            const data: IAlarm & { alarmTime?: number } = JSON.parse(e.data);
            if (Date.now() - (data.alarmTime || data.time) <= 1000) {
                setTimeout(this.alarm.bind(this, data), this.delay);
            }
        };
    }

    private alarm(data: IAlarm & { alarmTime?: number }) {
        this.$event.emit(NOTIFY_KEY, data);
        switch (data.type) {
            case ALARM_TYPE.TAG_OUT:
                return this.$event.emit(MISS, data.deviceId);
            default:
                break;
        }
    }
}
</script>

<style lang="postcss" module>
.main {
    padding: 0;
    position: relative;
}
.mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200px;
    background-color: #e2e2e2;
}
</style>

