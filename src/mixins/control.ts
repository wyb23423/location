/**
 * 历史回放控制
 */

import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import localforage from '@/assets/lib/localforage';

export interface PositionItem extends Vector3 {
    time: number;
    group: string;
}
export interface Fragment { [x: string]: PositionItem[]; }

const DEFAULT_FRAGMENT: number = 1200000;
@Component
export default class ControlMixin extends Vue {
    @Prop() public date?: number[]; // 选择的时间范围
    @Prop() public timeRange!: number; // 时间范围
    @Prop() public value!: number; // 播放进度
    @Prop() public loadCall?: (vm: this, index: number) => void; // 异步加载数据时的回调

    public tagNos: string[] = []; // 选中标签号
    public hasData: boolean = false; // 是否有可以用于播放的数据

    private fragmentLength: number = DEFAULT_FRAGMENT; // 一个片段的时间长度
    private controller?: AbortController; // 正在请求的数据片段中断控制器

    public get dateProxy() {
        return this.date || null;
    }
    public set dateProxy(date: number[] | null) {
        this.$emit('update:date', date);
    }

    public get progress() {
        return this.value || 0;
    }
    public set progress(progress: number) {
        this.$emit('input', progress);
    }

    // 是否可播放
    public get canPlay() {
        return !!(this.tagNos.length && this.date && this.date.length >= 2);
    }

    // 通过当前进度计算片段索引
    public get index() {
        const time = this.progress * this.timeRange / 100 - DEFAULT_FRAGMENT;
        if (time <= 0) {
            return 0;
        }

        return Math.ceil(time / this.fragmentLength);
    }

    // 数据片段数量
    public get count() {
        if (!this.timeRange) {
            return 0;
        }

        const time = Math.max(0, this.timeRange - DEFAULT_FRAGMENT);
        return Math.ceil(time / this.fragmentLength) + 1;
    }

    public destroyed() {
        this.controller && this.controller.abort();
    }

    // 加载数据
    public loadData() {
        if (!this.timeRange) {
            return Promise.reject('时间范围错误');
        }

        if (this.timeRange > 10800000) {
            return Promise.reject('选择的时间范围不得超过3小时');
        }

        this.controller && this.controller.abort(); // 中止现在的所有未完成请求

        const index = this.index; // 当前进度所处的片段索引
        if (!index) {
            this.fragmentLength = DEFAULT_FRAGMENT;
        }

        const start = this.date![0] + index * this.fragmentLength; // 开始时间
        const end = Math.min(start + this.fragmentLength, this.date![1]); // 结束时间

        return this.fetch(start, end)
            .then((datas: ITagInfo[]) => index ? datas : localforage.clear().then(() => datas))
            .then(datas => {
                if (!index) {
                    // 根据第一个片段数据量改变之后片段的时间长度
                    this.fragmentLength = DEFAULT_FRAGMENT * 10000 / (datas.length || 10000);
                }
                this.hasData = true;

                return this.syncLoad(end, index) // 加载接下来的几个片段
                    .savePosition(index, datas); // 存储当前片段数据
            });
    }

    // 异步加载数据
    private syncLoad(time: number, index: number) {
        if (!(this.date && this.date[1] != null && time < this.date[1])) {
            return this;
        }

        this.controller = new AbortController();
        const arr = [];
        for (let i = 1; i <= 6; i++) {
            arr.push(
                this.fetch(
                    time, Math.min(time + this.fragmentLength, this.date[1]),
                    this.controller
                )
                    .then((datas: ITagInfo[]) => {
                        this.savePosition(index + i, datas);
                        this.loadCall && this.loadCall(this, index + i);
                    })
            );
            time += this.fragmentLength;
            if (time >= this.date[1]) {
                break;
            }
        }
        // 加载下一批片段
        Promise.all(arr).then(() => this.syncLoad(time, index + 6)).catch(console.log);

        return this;
    }

    // 请求数据
    private fetch(start: number, end: number, controller?: AbortController) {
        const offset = new Date().getTimezoneOffset() * 60000;
        return this.$http
            .post({
                url: '/api/tag/queryTagHistory',
                body: {
                    startTime: new Date(start - offset),
                    endTime: new Date(end - offset),
                    tagNos: this.tagNos
                },
                headers: {
                    'Content-Type': 'application/json'
                },
                controller
            }).then(res => {
                const datas: ITagInfo[] = res.pagedData.datas;

                return Promise.resolve(datas);
            });
    }

    // 存储数据
    private async savePosition(index: number, data: ITagInfo[]) {
        try {
            await localforage.getItem<PositionItem>(index + '');
        } catch (e) {
            const fragment: Fragment = {};
            const offset = new Date().getTimezoneOffset() * 60000;
            data.forEach(v => {
                if (v.position.every(p => +p >= 0)) {
                    (fragment[v.sTagNo] || (fragment[v.sTagNo] = [])).push({
                        x: +v.position[1],
                        y: +v.position[2],
                        z: +v.position[3] || 0,
                        time: new Date((<string>v.time)).getTime() + offset,
                        group: v.sGroupNo
                    });
                }
            });

            localforage.setItem(index + '', fragment);
        }
    }
}
