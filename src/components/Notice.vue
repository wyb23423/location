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
                prop="tagNo"
                label="标签号"
                min-width="100"
                :filters="filters.tagNo"
                :filter-method="filterHandler"
            ></el-table-column>
            <el-table-column
                prop="alarmTime"
                label="报警时间"
                min-width="160"
                :filters="filters.alarmTime"
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
                清除异常
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
import { Async, loopAwait } from '@/assets/utils/util';

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
        const tagNo = new Set();
        const alarmTime = new Set();

        this.messages.forEach(v => {
            type.add(v.type);
            tagNo.add(v.tagNo);
            alarmTime.add(v.alarmTime);
        });
        const format = (<any>this.$options.filters).date;

        return {
            type: Array.from(type).map(v => ({ text: v, value: v })),
            tagNo: Array.from(tagNo).map(v => ({ text: v, value: v })),
            alarmTime: Array.from(alarmTime).map(v => ({
                text: format(v),
                value: v
            }))
        };
    }

    public get list() {
        return this.messages.slice((this.page - 1) * 50, this.page * 50);
    }

    public created() {
        this.$event
            .on(NOTIFY_KEY, (v: IAlarm) => {
                this.messageStore.setItem(this.itemToString(v), v);

                errorStore
                    .getItem<number>(v.tagNo)
                    .then(count => errorStore.setItem(v.tagNo, ++count))
                    .catch(() => {
                        errorStore.setItem(v.tagNo, 1);

                        // 更换标签图片为异常图片;
                        this.$event.emit(MODIFY_TAG_ICON, v.tagNo, ERROR_IMG);
                    });

                this.notify(v);
            })
            .on(ALARM_DEAL, (v: IAlarm) => {
                const message = this.messages.find(
                    m => this.itemToString(m) === this.itemToString(v)
                );

                message && this.reset(message);
            })
            .on(RECOVERY, () =>
                // 恢复报警状态
                this.messageStore.iterate<IAlarm, void>(v => {
                    this.notify(v);
                })
            );
    }

    public mounted() {
        this.setSize();
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
    @Async()
    private async reset(v: IAlarm) {
        const el = this.elNotify.get(v);
        if (el) {
            el.close();
            this.notifyCount--;
            this.elNotify.delete(v);
        }

        const index = this.messages.indexOf(v);
        if (index > -1) {
            this.messages.splice(index, 1);
            await this.notify(this.messages.splice(this.notifyCount, 1)[0]);

            this.messageStore.removeItem(this.itemToString(v));
        }

        const count = (await errorStore.getItem<number>(v.tagNo)) - 1;
        if (count <= 0) {
            this.$event.emit(MODIFY_TAG_ICON, v.tagNo);
            errorStore.removeItem(v.tagNo);
        } else {
            errorStore.setItem(v.tagNo, count);
        }
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
                            title: `标签${v.tagNo}异常`,
                            message: `${format(v.alarmTime)}: ${v.alarmMsg}`,
                            duration: 0,
                            showClose: false,
                            customClass: 'notice-component',
                            onClick: () => {
                                this.$confirm(`异常${v.alarmMsg}已解决?`)
                                    .then(() => this.reset(v))
                                    .catch(console.log);
                            }
                        });

                        this.elNotify.set(v, el);
                    });
            }
        }

        return (this.notifyPromise = this.notifyPromise
            .then(this.$nextTick)
            .then(() => this.updateMore(oldCount)));
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
        return [item.tagNo, item.type, item.alarmTime, item.alarmMsg].join('$');
    }

    @Async()
    private async setSize() {
        await loopAwait(
            () => !!(document.body.offsetWidth && document.body.offsetHeight)
        );

        this.maxHeight = document.body.offsetHeight - 150;
        if (document.body.offsetWidth <= SX_WIDTH) {
            this.size = '100%';
        }
    }
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