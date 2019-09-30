<template>
    <el-drawer title="报警列表" :visible.sync="drawer" :size="size">
        <el-table
            :data="list"
            style="padding: 0 10px"
            stripe
            size="mini"
            :max-height="maxHeight"
            @row-click="doDeal"
        >
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
                :filters="filters.time"
                :filter-method="filterHandler"
                :formatter="formatter"
            ></el-table-column>
            <el-table-column
                prop="alarmMsg"
                label="报警信息"
                min-width="255"
            ></el-table-column>
        </el-table>
        <el-pagination
            style="margin-top: 20px; text-align: right"
            small
            hide-on-single-page
            layout="prev, pager, next"
            :total="messages.length"
            :page-size="50"
            @current-change="page = $event"
        >
        </el-pagination>
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
    SX_WIDTH
} from '../constant';
import { ElNotificationComponent } from 'element-ui/types/notification';
import { ElTableColumn } from 'element-ui/types/table-column';
import { ElDrawer } from 'element-ui/types/drawer';
import { Ref } from 'vue-property-decorator';
import { getAndCreateStore } from '../assets/lib/localstore';

export const errorStore = getAndCreateStore('ERROR_STORE');

@Component
export default class Notice extends Vue {
    public drawer: boolean = false;
    public messages: IAlarm[] = [];
    public page: number = 1;
    public maxHeight: number = 666;
    public size: string = '50%';

    private elNotify = new Map<IAlarm | string, ElNotificationComponent>();
    private notifyCount: number = 0;
    private notifyPromise = Promise.resolve();

    public get filters() {
        const type = new Set();
        const tagNo = new Set();
        const baseNo = new Set();
        const time = new Set();

        this.messages.forEach(v => {
            type.add(v.type);
            tagNo.add(v.tagNo);
            baseNo.add(v.baseNo);
            time.add(v.alarmTime);
        });
        const format = (<any>this.$options.filters).date;

        return {
            type: Array.from(type).map(v => ({ text: v, value: v })),
            tagNo: Array.from(tagNo).map(v => ({ text: v, value: v })),
            baseNo: Array.from(baseNo).map(v => ({ text: v, value: v })),
            time: Array.from(time).map(v => ({ text: format(v), value: v }))
        };
    }

    public get list() {
        return this.messages.slice((this.page - 1) * 50, this.page * 50);
    }

    public created() {
        this.$event.on(NOTIFY_KEY, (v: IAlarm) => {
            errorStore
                .getItem<number>(v.tagNo)
                .then(count => errorStore.setItem(v.tagNo, ++count))
                .catch(() => {
                    errorStore.setItem(v.tagNo, 1);

                    // 更换标签图片为异常图片;
                    this.$event.emit(
                        MODIFY_TAG_ICON,
                        v.tagNo,
                        '/images/error.png'
                    );
                });

            this.notify(v);
        });

        this.$event.on(ALARM_DEAL, (v: IAlarm) => {
            const message = this.messages.find(m =>
                Object.keys(m).every((k: keyof IAlarm) => m[k] === v[k])
            );

            this.reset(message!);
        });
    }

    public mounted() {
        this.maxHeight = document.body.offsetHeight - 150;
        if (document.body.offsetWidth <= SX_WIDTH) {
            this.size = '100%';
        }
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

    public doDeal(v: IAlarm) {
        this.$confirm(`异常${v.alarmMsg}已解决?`)
            .then(() => this.reset(v))
            .catch(console.log);
    }

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
        }

        if (v) {
            errorStore
                .getItem<number>(v.tagNo)
                .then(count => {
                    count--;

                    if (count <= 0) {
                        this.$event.emit(MODIFY_TAG_ICON, v.tagNo);
                        errorStore.removeItem(v.tagNo);
                    } else {
                        errorStore.setItem(v.tagNo, count);
                    }
                })
                .catch(console.log);
        }
    }

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
                            onClick: () => this.doDeal(v)
                        });

                        this.elNotify.set(v, el);
                    });
            }
        }

        this.notifyPromise = this.notifyPromise
            .then(this.$nextTick)
            .then(() => this.updateMore(oldCount));
    }

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
}
</script>

<style lang="postcss" module>
</style>

<style lang="postcss">
.notice-component {
    z-index: 2000 !important;
}
</style>