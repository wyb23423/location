/** @format */

import * as Bluetooth from '../../utils/bluetooth-promise';
import ERROR_INFO from '../../constant/error';
import { LINK_STATUS, BluetoothDevices, IndexMap } from '../../constant/const';
import Link from '../../mixins/link';

// index.ts
// 获取应用实例

Page({
    ...Link.prototype,
    canUse: false,
    map: new Map() as IndexMap, // 记录蓝牙设备在数组中的位置
    data: {
        bluetooth: [] as BluetoothDevices[],
        linked: [] as BluetoothDevices[],
        isSearch: false,
        LINK_STATUS: {
            UNCONNECTED: LINK_STATUS.UNCONNECTED,
            ON_CONNECTION: LINK_STATUS.ON_CONNECTION,
            CONNECTED: LINK_STATUS.CONNECTED,
        },
    },
    onLoad() {
        wx.authorize({
            scope: 'scope.userLocation',
            success: this.search.bind(this),
        });
        this._applyEvents();
    },
    none() {
        //
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
            this.map.forEach((v, k, m) => v.arrName === 'bluetooth' && m.delete(k));
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
                const { arrName, index } = this.map.get(v.deviceId) || {};
                const device: BluetoothDevices = { ...v, link: LINK_STATUS.UNCONNECTED };
                let key = '';
                if (arrName && index != null) {
                    key = `${arrName}[${index}]`;
                    device.link = this.data[arrName][index].link;
                } else {
                    const i = this.data.bluetooth.length;
                    this.map.set(v.deviceId, { arrName: 'bluetooth', index: i });
                    key = `bluetooth[${i}]`;
                }

                data[key] = device;
            });

            this.setData(data);
        });
    },
});
