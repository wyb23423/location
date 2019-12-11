import Vue from 'vue';
import { arr2obj, getIp, getConfig } from '@/assets/utils/util';
import Component from 'vue-class-component';
import { GET_TAG } from '@/constant/request';

@Component
export class WebSocketInit extends Vue {
    protected groups: string[] = [];
    protected tagAll!: { [x: string]: ITag }; // 标签

    private ws: WebSocket[] = [];
    private count!: number;

    public created() {
        this.count = 0;

        // 获取所有标签数据
        this.tagAll = {};
        this.$http.get(GET_TAG, {
            currentPage: 1,
            pageSize: 1_0000_0000
        })
            .then(res => this.tagAll = arr2obj(res.pagedData.datas, 'id', false))
            .catch(() => console.log);
    }

    public beforeDestroy() {
        this.closeWebSocket();
        this.tagAll = {};
    }

    protected initWebSocket(isRelink?: boolean) {
        if (this.ws.length && !isRelink) {
            return;
        }

        this.closeWebSocket();

        const ip = getIp();
        if (!ip) {
            return;
        }

        // ==============================收到标签信息后的处理
        const handler = (event: MessageEvent) => {
            const data: ITagInfo = JSON.parse(event.data);
            if (
                this.groups.includes(data.groupNo)
                && this.tagAll[data.sTagNo]
                && data.position.every(v => +v >= 0)
            ) {
                this.doMonitor(data);
            }
        };
        // ======================================
        const wsUrl = getConfig<string>('websoket.position', 'ws://#{ip}/realtime/position');
        const ws = new WebSocket(wsUrl.replace('#{ip}', ip));
        ws.onopen = () => this.count = 0;
        ws.onmessage = handler;
        ws.onerror = () => this.count++ <= 5 && this.initWebSocket(true);

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
