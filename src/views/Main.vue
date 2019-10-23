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
import Header from '../components/Header.vue';
import { Prop } from 'vue-property-decorator';
import { NOTIFY_KEY } from '@/constant';
import { getIp } from '@/assets/utils/util';

@Component({
    components: {
        'app-nav': Header
    }
})
export default class Main extends Vue {
    private timer?: number;

    public created() {
        this.link();
    }

    public destroyed() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    private link() {
        const ip = getIp();
        if (!ip) {
            return;
        }

        const ws = new WebSocket(`ws://${ip}/realtime/alarm`);
        ws.onmessage = (msg: MessageEvent) => {
            let data: Omit<IAlarm, 'id'>;
            try {
                data = JSON.parse(msg.data);
            } catch (e) {
                const arr = msg.data.split('$');
                data = {
                    baseNo: arr[0],
                    tagNo: arr[1],
                    type: +arr[2],
                    alarmTime: +new Date(arr[3]).getTime(),
                    alarmMsg: arr[4]
                };
            }

            if (Date.now() - data.alarmTime <= 1000) {
                this.$event.emit(NOTIFY_KEY, data);
            }
        };
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

