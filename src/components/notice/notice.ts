import Component from 'vue-class-component';
import { NOTICE_MAX, MODIFY_TAG_ICON, } from '../../constant';
import { ElNotificationComponent } from 'element-ui/types/notification';
import { ElTableColumn } from 'element-ui/types/table-column';
import { Ref } from 'vue-property-decorator';
import { ElTable } from 'element-ui/types/table';
import { Async } from '@/assets/utils/await';
import NoticeInit, { errorStore } from './init';

@Component
export default class Notice extends NoticeInit {
    public drawer: boolean = false;
    public page: number = 1;
    public selected: IAlarm[] = [];

    private elNotify = new Map<string | IAlarm, ElNotificationComponent>();
    private notifyCount: number = 0;
    private notifyPromise = Promise.resolve();

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
            alarmTime: Array.from(alarmTime).map(v => ({ text: format(v), value: v }))
        };
    }
    public get list() {
        return this.messages.slice((this.page - 1) * 50, this.page * 50);
    }

    public formatter(r: any, c: any, v: number) {
        return (<any>this.$options.filters).date(v);
    }
    public filterHandler(value: string | number, row: IAlarm, column: ElTableColumn) {
        return Reflect.get(row, Reflect.get(column, 'property')) === value;
    }

    // 处理异常
    @Async()
    public async doDeal() {
        await this.$confirm('选中异常已解决?');

        const countObj = this.selected.reduce(
            (a, v) => {
                this.reset(v, true);
                const count = a[v.tagNo] || 0;
                a[v.tagNo] = count + 1;

                return a;
            },
            {} as Record<string, number>
        );
        Object.entries(countObj).forEach(([id, c]) => this.reduceError(id, c));

        // 需要从更多里添加到外面的报警
        const arr = this.messages.splice(this.notifyCount, NOTICE_MAX - this.notifyCount);
        arr.forEach(this.notify.bind(this));
        // message里已经没有信息了
        arr.length || this.updateMore(0);

        this.elTable.clearSelection();
        this.selected.length = 0;
    }

    // 隐藏报警
    protected reset(v: IAlarm, isMultiple?: boolean) {
        const el = this.elNotify.get(v);
        if (el) {
            el.close();
            this.notifyCount--;
            this.elNotify.delete(v);
        }

        const index = this.messages.indexOf(v);
        if (index > -1) {
            this.messages.splice(index, 1);
            isMultiple || this.notify(this.messages.splice(this.notifyCount, 1)[0]);
            this.messageStore.removeItem(this.itemToString(v));
        }

        isMultiple || this.reduceError(v.tagNo, 1);
    }

    // 显示报警
    protected notify(v: IAlarm) {
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

    // 清除报警记录
    private reduceError(deviceId: string, reduce: number) {
        errorStore
            .getItem<number>(deviceId)
            .then(count => {
                count -= reduce;

                if (count <= 0) {
                    this.$event.emit(MODIFY_TAG_ICON, deviceId);
                    errorStore.removeItem(deviceId);
                } else {
                    errorStore.setItem(deviceId, count);
                }
            })
            .catch(console.log);
    }
}
