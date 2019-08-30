import Vue from 'vue';
import { arr2obj } from '@/assets/utils/util';
import { BASE_URL } from '@/constant';
import Component from 'vue-class-component';

@Component
export class WebSocketInit extends Vue {
    protected groups: string[] = [];
    protected tagAll!: { [x: string]: ITag }; // 标签

    private ws: WebSocket[] = [];

    public created() {
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

        const ip = this.getIp();
        if (!ip) {
            return;
        }

        // ==============================收到标签信息后的处理
        const datas: any[] = [];
        let time: number = 0;
        const handler = (event: MessageEvent) => {
            const data: ITagInfo = JSON.parse(event.data);
            if (this.tagAll[data.sTagNo]) {
                datas.push(data);
                if (Date.now() - time > 50 / 3) {
                    datas.forEach(v => this.move(v));
                    datas.length = 0;
                    time = Date.now();
                }
            }
        };
        // ======================================

        // 两套后台建立websocket方式不同，通过配置确定(暂定)
        const countConfig = JSON.parse(sessionStorage.getItem('config')!).SOCKET_COUNT;
        if (countConfig === 'multiple') {
            const t = Date.now();
            this.ws = this.groups.map(k => {
                const ws = new WebSocket(`ws://${ip}/realtime/position/${k}/${t}`);
                ws.onmessage = handler;
                return ws;
            });
        } else {
            const ws = new WebSocket(`ws://${ip}/realtime/position`);
            ws.onopen = () => ws.send(JSON.stringify(this.groups));
            ws.onmessage = handler;
            this.ws = [ws];
        }
    }

    protected move(tag: ITagInfo) {
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

    private getIp() {
        let ip: string = location.hostname;
        if (process.env.NODE_ENV !== 'production') {
            const res = BASE_URL.match(/^http:\/\/([\w\d\.]+)(:\d+)?\/$/);
            if (res) {
                ip = res[1];
            } else {
                return console.error('域名解析失败');
            }
        }

        return ip;
    }
}
