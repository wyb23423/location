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

export function ab2hex(buffer: ArrayBuffer): string {
    return Array.prototype.map
        .call(new Uint8Array(buffer), (bit: number) =>
            bit
                .toString(16)
                .padStart(4, '0')
                .slice(-2),
        )
        .join('');
}

// function code2utf8(uni: number): string {
//     let uni2 = uni.toString(2);
//     if (uni < 128) {
//         return uni.toString(16);
//     } else if (uni < 2048) {
//         uni2 = ('00000000000000000' + uni2).slice(-11);
//         const s1 = parseInt('110' + uni2.substring(0, 5), 2);
//         const s2 = parseInt('10' + uni2.substring(5), 2);
//         return s1.toString(16) + ',' + s2.toString(16);
//     } else {
//         uni2 = ('00000000000000000' + uni2).slice(-16);
//         const s1 = parseInt('1110' + uni2.substring(0, 4), 2);
//         const s2 = parseInt('10' + uni2.substring(4, 10), 2);
//         const s3 = parseInt('10' + uni2.substring(10), 2);
//         return s1.toString(16) + ',' + s2.toString(16) + ',' + s3.toString(16);
//     }
// }
export function string2buffer(str: string): ArrayBuffer {
    // let val = '';
    // for (let i = 0; i < str.length; i++) {
    //     val += ',' + code2utf8(str.codePointAt(i) || 0);
    // }
    // // val += ',00';
    // console.log(val);

    const arr = str.match(/[\da-f]{2}/gi);
    // 将16进制转化为ArrayBuffer
    return new Uint8Array(arr ? arr.map(h => parseInt(h, 16)) : []).buffer;
}
