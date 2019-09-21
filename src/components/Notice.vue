<template>
    <el-drawer title="报警列表" :visible.sync="drawer" size="50%">
        <el-table
            :data="messages"
            style="padding: 0 10px"
            stripe
            size="mini"
            max-height="666"
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
    </el-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { NOTICE_MAX, NOTIFY_KEY, ALARM_DEAL } from '../constant';
import { ElNotificationComponent } from 'element-ui/types/notification';
import { ElTableColumn } from 'element-ui/types/table-column';

@Component
export default class Notice extends Vue {
    public drawer: boolean = false;
    public messages: IAlarm[] = [];
    private elNotify = new Map<IAlarm | string, ElNotificationComponent>();
    private notifyCount: number = 0;

    private queue: IAlarm[] = [];
    private timer?: number;

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

        return {
            type: Array.from(type).map(v => ({ text: v, value: v })),
            tagNo: Array.from(tagNo).map(v => ({ text: v, value: v })),
            baseNo: Array.from(baseNo).map(v => ({ text: v, value: v })),
            time: Array.from(time).map(v => ({ text: v, value: v }))
        };
    }

    public created() {
        this.$event.on(NOTIFY_KEY, (v: IAlarm) => {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.queue.push(v);

            this.timer = setTimeout(() => {
                let msg = this.queue.shift();
                while (msg) {
                    this.notify(msg);
                    msg = this.queue.shift();
                }
            }, 200);
        });
        this.$event.on(ALARM_DEAL, (v: IAlarm) => {
            const message = this.messages.find(m =>
                Object.keys(m).every((k: keyof IAlarm) => m[k] === v[k])
            );
            message && this.reset(message);

            const index = this.queue.findIndex(m =>
                Object.keys(m).every((k: keyof IAlarm) => m[k] === v[k])
            );
            if (index > -1) {
                this.queue.splice(index, 1);
            }
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
    }

    private notify(v?: IAlarm) {
        if (v && this.notifyCount < NOTICE_MAX) {
            this.notifyCount++;

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
        }

        v && this.messages.push(v);

        this.$nextTick(() => {
            let more = this.elNotify.get('more');
            more && more.close();

            const moreCount = this.messages.length - this.notifyCount;

            if (moreCount > 0) {
                more = this.$notify.info({
                    title: '更多',
                    message: `+${moreCount}`,
                    duration: 0,
                    showClose: false,
                    customClass: 'notice-component',
                    onClick: () => (this.drawer = true)
                });
                this.elNotify.set('more', more);
            }
        });
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