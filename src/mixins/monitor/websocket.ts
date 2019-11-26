import Vue from 'vue';
import { arr2obj, getIp, getConfig } from '@/assets/utils/util';
import Component from 'vue-class-component';

@Component
export class WebSocketInit extends Vue {
    protected groups: string[] = [];
    protected tagAll!: { [x: string]: ITag }; // 标签

    private ws: WebSocket[] = [];
    private count!: number; // 重连websocket次数

    public created() {
        this.count = 0;

        // 获取所有标签数据
        this.tagAll = {};
        this.$http.get('/api/tag/getall', {
            currentPage: 1,
            pageSize: 1_0000_0000
        })
            .then(res => this.tagAll = arr2obj(res.pagedData.datas, 'tagNo', false))
            .catch(() => console.log);
    }

    public beforeDestroy() {
        this.closeWebSocket();
        this.tagAll = {};
    }

    protected initWebSocket() {
        this.closeWebSocket();

        if (!this.groups.length) {
            return console.warn('当前地图没有设置分组，无法定位');
        }

        const ip = getIp();
        if (!ip) {
            return;
        }

        // ==============================
        const wsUrl = getConfig<string>('websoket.position', 'ws://#{ip}/realtime/position');
        const ws = new WebSocket(`${wsUrl.replace('#{ip}', ip)}/${this.groups.join(',')}`);
        ws.onopen = () => this.count = 0;
        ws.onmessage = (event: MessageEvent) => {
            const data: ITagInfo = JSON.parse(event.data);
            if (this.tagAll[data.sTagNo] && data.position.every(v => +v >= 0)) {
                this.doMonitor(data);
            }
        };
        ws.onerror = () => this.count++ <= 5 && this.initWebSocket();

        this.ws = [ws];
    }

    protected doMonitor(tag: ITagInfo) {
        //
    }

    private closeWebSocket() {
        let ws = this.ws.pop();
        while (ws) {
            ws.close();
            ws.onmessage = null;
            ws = this.ws.pop();
        }

        return this;
    }
}
