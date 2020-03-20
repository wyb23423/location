/** @format */

import * as Bluetooth from '../../utils/bluetooth-promise';
import ERROR_INFO from '../../constant/error';
import { LINK_STATUS, BluetoothDevices, IndexMap } from '../../constant/const';
import Link from '../../mixins/link';
import { getDevices } from '../../utils/util';

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
        // ==================================获取已配对的设备
        let i = 0;
        getDevices(
            (data): BluetoothDevices => {
                data.link = LINK_STATUS.UNCONNECTED;
                this.map.set(data.deviceId, { arrName: 'linked', index: i++ });

                return data;
            },
        )
            .then(linked => this.setData({ linked }))
            .catch(() => this.map.clear())
            .finally(this.search.bind(this));

        // 监听蓝牙事件
        this._applyEvents();
    },
    none() {
        //
    },
    // 开启/关闭搜索
    search() {
        wx.authorize({
            scope: 'scope.userLocation',
            success: async () => {
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
        });
    },
    // 开启蓝牙适配器
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
        // 发现设备后将其更新到对应的数组中
        wx.onBluetoothDeviceFound(async ({ devices }) => {
            const data = {} as { [key: string]: BluetoothDevices };
            devices.forEach(v => {
                const { arrName, index } = this.map.get(v.deviceId) || { arrName: null, index: null };
                const device: BluetoothDevices = { ...v, link: LINK_STATUS.UNCONNECTED };
                let key = '';
                if (arrName != null && index != null) {
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

        // 监听蓝牙适配器状态变化，在异常中断时进行处理
        wx.onBluetoothAdapterStateChange(({ available }) => {
            if (!available && this.canUse) {
                wx.showModal({
                    title: '提示',
                    content: '蓝牙适配器异常中断',
                    showCancel: false,
                });

                this.setData({ isSearch: this.canUse = false });
            }
        });
    },
});
