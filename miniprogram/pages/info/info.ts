/** @format */
import * as Bluetooth from '../../utils/bluetooth-promise';
import { STORGET_KEY_SUFFIX } from '../../constant/const';

type CharacteristicType = 'read' | 'write' | 'notify';

Page({
    deviceId: '', // 设备deviceId
    uuid: new Map<CharacteristicType, string[]>(),
    listener: null as null | WechatMiniprogram.OnBLECharacteristicValueChangeCallback,
    data: {
        name: '',
    },
    onLoad({ id, name }) {
        if (!(id && name)) {
            return wx.navigateBack();
        }

        this.setData({ name });
        this._init(id);
    },
    onHide() {
        // 取消监听低功耗蓝牙设备的特征值变化事件。
        this.listener && wx.offBLECharacteristicValueChange(this.listener);
    },
    cancelMatch() {
        wx.removeStorage({ key: this.deviceId + STORGET_KEY_SUFFIX });

        const pages = getCurrentPages();
        pages[pages.length - 2].cancelConnection(this.deviceId);

        wx.navigateBack();
    },
    async _init(deviceId: string) {
        this.deviceId = deviceId;

        try {
            const { services } = await Bluetooth.getBLEDeviceServices({ deviceId });
            const arr = [];
            for (const v of services) {
                if (v.isPrimary) {
                    arr.push(this._UUID(v.uuid, deviceId));
                }
            }
            await Promise.all(arr);
        } catch (e) {
            return;
        }

        this._applyEvents();
    },
    async _applyEvents() {
        const notify = this.uuid.get('notify');
        if (!notify) {
            return;
        }

        await Bluetooth.notifyBLECharacteristicValueChange({
            deviceId: this.deviceId,
            characteristicId: notify[0],
            serviceId: notify[1],
            state: true,
        });

        this.listener = ({ value }): void => {
            console.log(value);
        };

        wx.onBLECharacteristicValueChange(this.listener);
    },
    async _UUID(serviceId: string, deviceId: string) {
        const { characteristics } = await Bluetooth.getBLEDeviceCharacteristics({ deviceId, serviceId });
        for (const { uuid, properties } of characteristics) {
            if (this.uuid.size >= 3) {
                return;
            }

            if (!this.uuid.has('read') && properties.read) {
                this.uuid.set('read', [uuid, serviceId]);
            }

            if (!this.uuid.has('write') && properties.write) {
                this.uuid.set('write', [uuid, serviceId]);
            }

            if (!this.uuid.has('notify') && (properties.notify || properties.indicate)) {
                this.uuid.set('notify', [uuid, serviceId]);
            }
        }
    },
});
