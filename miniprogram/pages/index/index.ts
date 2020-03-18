/** @format */

import * as Bluetooth from '../../utils/bluetooth-promise';
import ERROR_INFO from '../../constant/error';

// index.ts
// 获取应用实例

type BluetoothDevices = WechatMiniprogram.CallbackResultBlueToothDevice;

Page({
    data: {
        bluetooth: [] as BluetoothDevices[],
        isSearch: false,
    },
    onLoad() {
        wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
                this.search();
            },
        });
        this._applyEvents();
    },
    async search() {
        const isSearch = this.data.isSearch;
        if (isSearch) {
            Bluetooth.stopBluetoothDevicesDiscovery();
            await Bluetooth.closeBluetoothAdapter();
        } else {
            try {
                await this._init();
            } catch (e) {
                return;
            }

            this.data.bluetooth.length = 0;
            Bluetooth.startBluetoothDevicesDiscovery({});
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

        return Bluetooth.openBluetoothAdapter().catch((res: WechatMiniprogram.BluetoothError) => {
            wx.showModal({
                title: '提示',
                content: ERROR_INFO.get(res.errCode) || res.errMsg,
                showCancel: false,
            });

            return Promise.reject(res.errMsg);
        });
    },
    _applyEvents() {
        wx.onBluetoothDeviceFound(async ({ devices }) => {
            const bluetooth = this.data.bluetooth;
            devices.forEach(v => {
                const index = bluetooth.findIndex(item => item.deviceId === v.deviceId);
                bluetooth[index > -1 ? index : bluetooth.length] = v;
            });

            this.setData({ bluetooth });
        });
    },
});
