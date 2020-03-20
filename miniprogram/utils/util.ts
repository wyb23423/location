/** @format */

import { BluetoothDevices, STORGET_KEY_SUFFIX } from '../constant/const';

const formatNumber = (n: number): string => {
    const s = n.toString();
    return s[1] ? s : '0' + s;
};

export const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

export function getDevices(
    fn: (data: BluetoothDevices) => BluetoothDevices = (data): BluetoothDevices => data,
): Promise<BluetoothDevices[]> {
    const { keys } = wx.getStorageInfoSync();
    return Promise.all(
        keys
            .filter(k => k.endsWith(STORGET_KEY_SUFFIX))
            .map(
                k =>
                    new Promise<BluetoothDevices>((resolve, reject) => {
                        wx.getStorage({
                            key: k,
                            success: ({ data }) => resolve(fn(data)),
                            fail: reject,
                        });
                    }),
            ),
    );
}
