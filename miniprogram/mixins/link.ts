/**
 * @format
 * @file 连接设备
 */

import * as Bluetooth from '../utils/bluetooth-promise';
import { BluetoothDevices, LINK_STATUS, IndexMap, STORGET_KEY_SUFFIX } from '../constant/const';
import ERROR_INFO from '../constant/error';

type LinkData = {
    bluetooth: BluetoothDevices[]; // 可用设备
    linked: BluetoothDevices[]; // 已配对设备
    isSearch: boolean;
};

export default class Link {
    public data!: LinkData;
    public setData!: (data: WechatMiniprogram.IAnyObject, callback?: () => void) => void;

    private handler?: WechatMiniprogram.OnBLEConnectionStateChangeCallback;
    private map!: IndexMap;

    public async linkByBluetooth(e: BaseEvent<{ index: string }>): Promise<void> {
        const index = +e.currentTarget.dataset.index;

        const device = await this._link(index, 'bluetooth');
        const { bluetooth, linked } = this.data;

        // 更新位置缓存
        this.map.set(device.deviceId, { arrName: 'linked', index: linked.length });

        // 从可用设备中删除
        bluetooth.splice(index, 1);

        // 修改连接状态并添加到已配对设备中
        device.link = LINK_STATUS.CONNECTED;
        linked.push(device);

        this.setData({ bluetooth, linked });
    }

    public async linkByLinked(e: BaseEvent<{ index: string }>): Promise<void> {
        const index = +e.currentTarget.dataset.index;
        const device = this.data.linked[index];
        if (device.link === LINK_STATUS.ON_CONNECTION) {
            return;
        }

        const key = `linked[${index}].link`;
        if (device.link === LINK_STATUS.CONNECTED) {
            const name = device.localName || device.name || device.deviceId;
            return wx.showModal({
                title: '断开与该设备的连接吗?',
                content: `您将断开与${name}的连接。`,
                success: ({ confirm }) => {
                    if (confirm) {
                        this.setData({ [key]: LINK_STATUS.UNCONNECTED });
                        this.map.delete(device.deviceId);
                        Bluetooth.closeBLEConnection({ deviceId: device.deviceId });
                    }
                },
            });
        }

        await this._link(index, 'linked');
        this.setData({ [key]: LINK_STATUS.CONNECTED });
    }

    public async search(): Promise<void> {
        //
    }

    public removeConnectionStateChangeListener(): void {
        this.handler && wx.offBLEConnectionStateChange(this.handler);
        this.handler = void 0;
    }

    public cancelConnection(deviceId: string): void {
        const { index } = this.map.get(deviceId) || { index: null };
        if (index != null) {
            this.map.delete(deviceId);
            this.data.linked.splice(index, 1);
            this.setData({ linked: this.data.linked });

            Bluetooth.closeBLEConnection({ deviceId });
        }
    }

    private async _link(index: number, k: 'bluetooth' | 'linked'): Promise<BluetoothDevices> {
        const device = this.data[k][index];

        if (device.link === LINK_STATUS.UNCONNECTED) {
            const key = `${k}[${index}].link`;
            this.setData({ [key]: LINK_STATUS.ON_CONNECTION });
            this.data.isSearch && this.search();

            try {
                await Bluetooth.createBLEConnection({
                    deviceId: device.deviceId,
                    timeout: 60000,
                });
                wx.setStorage({ key: device.deviceId + STORGET_KEY_SUFFIX, data: device });

                this.handler || this._addConnectionStateChangeListener();

                return device;
            } catch (e) {
                this.setData({ [key]: LINK_STATUS.UNCONNECTED });

                const { errCode, errMsg } = e as WechatMiniprogram.BluetoothError;
                const title = ERROR_INFO.get(errCode) || errMsg;
                title && wx.showToast({ title, icon: 'none' });
            }
        }

        return Promise.reject();
    }

    private _addConnectionStateChangeListener(): void {
        this.handler = (res): void => {
            const { index } = this.map.get(res.deviceId) || { index: null };
            if (index != null) {
                const device = this.data.linked[index];
                if (device.link === LINK_STATUS.CONNECTED && !res.connected) {
                    let count = 0;
                    const doLink = async (): Promise<void> => {
                        try {
                            count++;
                            await Bluetooth.createBLEConnection({
                                deviceId: device.deviceId,
                                timeout: 1000,
                            });
                        } catch (e) {
                            if (count < 3) {
                                return doLink();
                            }

                            this.setData({ [`linked[${index}].link`]: LINK_STATUS.UNCONNECTED });
                        }
                    };

                    doLink();
                }
            }
        };

        wx.onBLEConnectionStateChange(this.handler);
    }
}
