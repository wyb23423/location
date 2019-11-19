/**
 * notice组件初始化
 */

import Vue from 'vue';
import Component from 'vue-class-component';
import { NOTIFY_KEY, ALARM_DEAL, RECOVERY, MODIFY_TAG_ICON, ERROR_IMG, SX_WIDTH } from '@/constant';
import { Async, loopAwait, getConfig } from '@/assets/utils/util';
import { getAndCreateStore } from '@/assets/lib/localstore';

export const errorStore = getAndCreateStore('ERROR_STORE');

@Component
export default class NoticeInit extends Vue {
    public messages: IAlarm[] = [];
    public maxHeight: number = 666;
    public size: string = '50%';

    protected messageStore = getAndCreateStore('MESSAGE');

    public created() {
        this.$event.on(NOTIFY_KEY, this.notifyEvent.bind(this))
            .on(ALARM_DEAL, (v: IAlarm) => {
                v = this.adapter(v);
                const message = this.messages.find(m => this.itemToString(m) === this.itemToString(v));
                message && this.reset(message);
            })
            .on(RECOVERY, () => this.messageStore.iterate<IAlarm, void>(this.notify.bind(this)));
    }

    public mounted() {
        this.setSize();
    }

    // 隐藏报警
    protected reset(v: IAlarm, isMultiple?: boolean) {
        //
    }
    // 显示报警
    protected notify(v: IAlarm) {
        //
    }

    protected itemToString(item: IAlarm) {
        return [item.deviceId, item.type, item.time, item.content].join('$');
    }

    // 触发报警提示的全局事件函数
    private notifyEvent(v: IAlarm) {
        v = this.adapter(v);
        this.messageStore.setItem(this.itemToString(v), v);

        errorStore
            .getItem<number>(v.deviceId)
            .then(count => errorStore.setItem(v.deviceId, ++count))
            .catch(() => {
                errorStore.setItem(v.deviceId, 1);

                // 更换标签图片为异常图片;
                this.$event.emit(
                    MODIFY_TAG_ICON,
                    v.deviceId,
                    ERROR_IMG
                );
            });

        this.notify(v);
    }

    // 数据适配器
    private adapter(item: IAlarm) {
        const { id, deviceId, type, time, content, tagNo, alarmTime, alarmMsg } = <IAlarm & OldAlarm>item;

        return {
            id, type,
            deviceId: deviceId || tagNo,
            time: time || alarmTime,
            content: content || alarmMsg
        };
    }
    @Async()
    private async setSize() {
        await loopAwait(() => !!(document.body.offsetHeight && document.body.offsetWidth));

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
