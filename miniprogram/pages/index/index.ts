/** @format */

import * as Bluetooth from '../../utils/bluetooth-promise';
import ERROR_INFO from '../../constant/error';

// index.ts
// 获取应用实例

type BluetoothDevices = WechatMiniprogram.CallbackResultBlueToothDevice;

Page({
    canUse: false,
    map: new Map<string, number>(),
    data: {
        bluetooth: [] as BluetoothDevices[],
        isSearch: false,
    },
    onLoad() {
        wx.authorize({
            scope: 'scope.userLocation',
            success: this.search.bind(this),
        });
        this._applyEvents();
    },
    async search() {
        if (!this.canUse) {
            await this._init();
        }

        const isSearch = this.data.isSearch;
        if (isSearch) {
            Bluetooth.stopBluetoothDevicesDiscovery();
        } else {
            this.data.bluetooth.length = 0;
            this.map.clear();
            Bluetooth.startBluetoothDevicesDiscovery({ allowDuplicatesKey: true });
        }

        this.data.isSearch = !isSearch;
        this.setData(this.data);
    },
    async _init() {
        await new Promise((resolve, reject) => {
            wx.getLocation({
                success: resolve,
                fail() {
                    wx.showModal({
                        title: '提示',
                        content: 'GPS未开启!',
                        showCancel: false,
                    });

                    reject('gps error!');
                },
            });
        });

        await Bluetooth.openBluetoothAdapter().catch((res: WechatMiniprogram.BluetoothError) => {
            wx.showModal({
                title: '提示',
                content: ERROR_INFO.get(res.errCode) || res.errMsg,
                showCancel: false,
            });

            return Promise.reject(res.errMsg);
        });

        this.canUse = true;
    },
    _applyEvents() {
        wx.onBluetoothDeviceFound(async ({ devices }) => {
            const data = {} as { [key: string]: BluetoothDevices };
            devices.forEach(v => {
                const index = this.map.get(v.deviceId);
                let key = `bluetooth[${this.map.size}]`;
                if (index != null) {
                    key = `bluetooth[${index}]`;
                } else {
                    this.map.set(v.deviceId, this.map.size);
                }

                data[key] = v;
            });

            this.setData(data);
        });
    },
});
