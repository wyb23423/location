<template>
    <el-drawer title="报警列表" :visible.sync="drawer" :size="size">
        <el-table
            :data="list"
            style="padding: 0 10px"
            stripe
            size="mini"
            ref="table"
            :max-height="maxHeight"
            @selection-change="selected = $event"
        >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column
                prop="type"
                label="报警类型"
                min-width="80"
                :filters="filters.type"
                :filter-method="filterHandler"
            ></el-table-column>
            <el-table-column
                prop="deviceId"
                label="标签号"
                min-width="100"
                :filters="filters.deviceId"
                :filter-method="filterHandler"
            ></el-table-column>
            <el-table-column
                prop="time"
                label="报警时间"
                min-width="160"
                :filters="filters.time"
                :filter-method="filterHandler"
                :formatter="formatter"
            ></el-table-column>
            <el-table-column
                prop="content"
                label="报警信息"
                min-width="255"
            ></el-table-column>
        </el-table>
        <div class="flex-center" :class="$style.bottom">
            <el-button
                @click="doDeal()"
                :disabled="!selected.length"
                size="mini"
            >
                解决异常
            </el-button>
            <el-pagination
                small
                hide-on-single-page
                layout="prev, pager, next"
                :total="messages.length"
                :page-size="50"
                @current-change="page = $event"
            >
            </el-pagination>
        </div>
    </el-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {
    NOTICE_MAX,
    NOTIFY_KEY,
    ALARM_DEAL,
    MODIFY_TAG_ICON,
    SX_WIDTH,
    ERROR_IMG,
    RECOVERY
} from '../constant';
import { ElNotificationComponent } from 'element-ui/types/notification';
import { ElTableColumn } from 'element-ui/types/table-column';
import { ElDrawer } from 'element-ui/types/drawer';
import { Ref } from 'vue-property-decorator';
import { getAndCreateStore } from '../assets/lib/localstore';
import { ElTable } from 'element-ui/types/table';
import { Async, loopAwait } from '@/assets/utils/await';

export const errorStore = getAndCreateStore('ERROR_STORE');

@Component
export default class Notice extends Vue {
    public drawer: boolean = false;
    public messages: IAlarm[] = [];
    public page: number = 1;
    public maxHeight: number = 666;
    public size: string = '50%';
    public selected: IAlarm[] = [];

    private elNotify = new Map<string | IAlarm, ElNotificationComponent>();
    private notifyCount: number = 0;
    private notifyPromise = Promise.resolve();
    private messageStore = getAndCreateStore('MESSAGE');

    @Ref('table') private readonly elTable!: ElTable;

    public get filters() {
        const type = new Set();
        const deviceId = new Set();
        const time = new Set();

        this.messages.forEach(v => {
            type.add(v.type);
            deviceId.add(v.deviceId);
            time.add(v.time);
        });
        const format = (<any>this.$options.filters).date;

        return {
            type: Array.from(type).map(v => ({ text: v, value: v })),
            deviceId: Array.from(deviceId).map(v => ({ text: v, value: v })),
            time: Array.from(time).map(v => ({ text: format(v), value: v }))
        };
    }

    public get list() {
        return this.messages.slice((this.page - 1) * 50, this.page * 50);
    }

    public created() {
        this.$event.on(NOTIFY_KEY, (v: IAlarm) => {
            v = this.adapter(v);
            this.messageStore.setItem(this.itemToString(v), v);

            errorStore
                .getItem<number>(v.deviceId)
                .then(count => errorStore.setItem(v.deviceId, ++count))
                .catch(() => {
                    errorStore.setItem(v.deviceId, 1);

                    // 更换标签图片为异常图片;
                    this.$event.emit(MODIFY_TAG_ICON, v.deviceId, ERROR_IMG);
                });

            this.notify(v);
        });

        this.$event.on(ALARM_DEAL, (v: IAlarm) => {
            v = this.adapter(v);
            const message = this.messages.find(
                m => this.itemToString(m) === this.itemToString(v)
            );

            message && this.reset(message);
        });
    }

    public mounted() {
        this.setSize();

        this.$event.on(RECOVERY, () => {
            // 恢复报警状态
            // 通过在 iteratorCallback 回调函数中返回一个非 undefined 的值能提前退出 iterate。
            // iteratorCallback 的返回值即作为整个迭代的结果，将被传入 successCallback。
            this.messageStore.iterate<IAlarm, void>(v => {
                this.notify(v);
            });
        });
    }

    public formatter(r: any, c: any, v: number) {
        return (<any>this.$options.filters).date(v);
    }

    public filterHandler(
        value: string | number,
        row: IAlarm,
        column: ElTableColumn
    ) {
        return Reflect.get(row, Reflect.get(column, 'property')) === value;
    }

    // 处理异常
    @Async()
    public async doDeal() {
        await this.$confirm('选中异常已解决?');

        const deal = async () => {
            const item = this.selected.shift();
            if (item) {
                await this.reset(item);
                deal();
            } else {
                this.elTable.clearSelection();
            }
        };
        deal();
    }

    // 隐藏报警
    private reset(v: IAlarm) {
        const el = this.elNotify.get(v);
        if (el) {
            el.close();
            this.notifyCount--;
            this.elNotify.delete(v);
        }

        const index = this.messages.indexOf(v);
        if (index > -1) {
            this.messages.splice(index, 1);
            this.notify(this.messages.splice(this.notifyCount, 1)[0]);

            this.messageStore.removeItem(this.itemToString(v));
        }

        return errorStore
            .getItem<number>(v.deviceId)
            .then(count => {
                count--;

                if (count <= 0) {
                    this.$event.emit(MODIFY_TAG_ICON, v.deviceId);
                    errorStore.removeItem(v.deviceId);
                } else {
                    errorStore.setItem(v.deviceId, count);
                }
            })
            .catch(console.log);
    }

    // 显示报警
    private async notify(v: IAlarm) {
        const oldCount: number = this.notifyCount;
        if (v) {
            this.messages.push(v);
            if (this.notifyCount < NOTICE_MAX) {
                this.notifyCount++;

                this.notifyPromise = this.notifyPromise
                    .then(this.$nextTick)
                    .then(() => {
                        const format = (<any>this.$options.filters).date;
                        const el = this.$notify.warning({
                            title: `标签${v.deviceId}异常`,
                            message: `${format(v.time)}: ${v.content}`,
                            duration: 0,
                            showClose: false,
                            customClass: 'notice-component',
                            onClick: () => {
                                this.$confirm(`异常${v.content}已解决?`)
                                    .then(() => this.reset(v))
                                    .catch(console.log);
                            }
                        });

                        this.elNotify.set(v, el);
                    });
            }
        }

        this.notifyPromise = this.notifyPromise
            .then(this.$nextTick)
            .then(() => this.updateMore(oldCount));
    }

    // 更新 “更多” 的显示
    private updateMore(oldCount: number) {
        let more = this.elNotify.get('more');

        const moreCount = this.messages.length - this.notifyCount;
        if (moreCount > 0) {
            if (!more || oldCount !== this.notifyCount) {
                more && more.close();

                more = this.$notify.info({
                    title: '更多',
                    message: `+${moreCount}`,
                    duration: 0,
                    showClose: false,
                    customClass: 'notice-component',
                    onClick: () => (this.drawer = true)
                });
                this.elNotify.set('more', more);
            } else {
                more.$data.message = `+${moreCount}`;
            }
        } else {
            more && more.close();
        }
    }

    private itemToString(item: IAlarm) {
        return [item.deviceId, item.type, item.time, item.content].join('$');
    }

    private adapter(item: IAlarm) {
        const {
            id,
            deviceId,
            type,
            time,
            content,
            tagNo,
            alarmTime,
            alarmMsg
        } = <IAlarm & OldAlarm>item;

        return {
            id,
            type,
            deviceId: deviceId || tagNo,
            time: time || alarmTime,
            content: content || alarmMsg
        };
    }

    @Async()
    private async setSize() {
        await loopAwait(
            () => !!(document.body.offsetHeight && document.body.offsetWidth)
        );

        this.maxHeight = document.body.offsetHeight - 150;
        if (document.body.offsetWidth <= SX_WIDTH) {
            this.size = '100%';
        }
    }
}

interface OldAlarm {
    tagNo: string;
    alarmTime: number;
    alarmMsg: string;
}
</script>

<style lang="postcss" module>
.bottom {
    justify-content: space-between !important;
    margin-top: 20px;
    padding-left: 10px;
}
</style>

<style lang="postcss">
.notice-component {
    z-index: 2000 !important;
}
</style>