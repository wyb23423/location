/**
 * @format
 * @file 连接设备
 */

import * as Bluetooth from '../utils/bluetooth-promise';
import { BluetoothDevices, LINK_STATUS, IndexMap } from '../constant/const';
import ERROR_INFO from '../constant/error';

type LinkData = {
    bluetooth: BluetoothDevices[]; // 可用设备
    linked: BluetoothDevices[]; // 已配对设备
};

export class Link {
    public data!: LinkData;

    private handler?: WechatMiniprogram.OnBLEConnectionStateChangeCallback;
    private map!: IndexMap;

    public setData(data: WechatMiniprogram.IAnyObject, callback?: () => void): void {
        console.log(data, callback);
    }

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
            this.removeConnectionStateChangeListener();
            await Bluetooth.closeBLEConnection({ deviceId: device.deviceId });
            this.setData({ [key]: LINK_STATUS.UNCONNECTED });

            return;
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

    private async _link(index: number, k: keyof LinkData): Promise<BluetoothDevices> {
        const device = this.data[k][index];

        if (device.link === LINK_STATUS.UNCONNECTED) {
            const key = `${k}[${index}].link`;
            this.setData({ [key]: LINK_STATUS.ON_CONNECTION });
            this.search();

            try {
                await Bluetooth.createBLEConnection({
                    deviceId: device.deviceId,
                    timeout: 60000,
                });

                this._addConnectionStateChangeListener();

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
            const { index } = this.map.get(res.deviceId) || {};
            if (index != null) {
                const device = this.data.linked[index];
                if (device.link === LINK_STATUS.CONNECTED && !res.connected) {
                    let count = 0;
                    const doLink = async (): Promise<void> => {
                        try {
                            count++;
                            await Bluetooth.createBLEConnection({
                                deviceId: device.deviceId,
                                timeout: 60000,
                            });
                        } catch (e) {
                            if (count < 10) {
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

const linkMethods = new Link();
export default linkMethods;
