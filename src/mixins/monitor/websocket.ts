/**
 * 创建实时监控的websocket连接
 * 主要用于实时监控页面
 * 也可用于其他页面
 */

import Vue from 'vue';
import { getIp, getConfig, Async } from '@/assets/utils/util';
import Component from 'vue-class-component';
import { GET_TAG } from '@/constant/request';

@Component
export class WebSocketInit extends Vue {
    protected groups: string[] = [];
    protected tagAll = new Map<string, ITag>();

    private ws?: WebSocket;
    private count!: number;

    public created() {
        this.initTagAll();
    }

    public beforeDestroy() {
        this.ws && this.ws.close();
        this.tagAll.clear();
    }

    // 用于初始化标签数据
    @Async()
    protected async initTagAll() {
        const { pagedData: { datas } }: ResponseData<ITag> = await this.$http.get(GET_TAG, {
            currentPage: 1,
            pageSize: 1_0000_0000
        });

        datas.forEach(v => this.tagAll.set(v.id, v));
    }

    protected initWebSocket(isRelink?: boolean) {
        if (this.ws && !isRelink) {
            return;
        }

        this.ws && this.ws.close();

        const ip = getIp();
        if (!ip) { return; }

        const wsUrl = getConfig<string>('websoket.position', 'ws://#{ip}/realtime/position');
        const ws = this.ws = new WebSocket(wsUrl.replace('#{ip}', ip));
        ws.addEventListener('open', () => this.count = 0);
        ws.addEventListener('error', () => this.count++ <= 5 && this.initWebSocket(true));
        ws.addEventListener('message', (event: MessageEvent) => {
            const data: ITagInfo = JSON.parse(event.data);
            this.isValid(data) ? this.handler(data) : this.invalid(data);
        });
    }

    // 判断收到的数据是否是需处理的有效数据
    protected isValid(data: ITagInfo) {
        return this.groups.includes(data.groupNo)
            && this.tagAll.has(data.sTagNo)
            && data.position.every(v => +v >= 0);
    }

    // 处理数据的方法
    protected handler(tag: ITagInfo) {
        //
    }

    protected invalid(tag: ITagInfo) {
        //
    }
}
