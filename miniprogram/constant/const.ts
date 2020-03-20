/** @format */

export type BluetoothDevices = WechatMiniprogram.CallbackResultBlueToothDevice & { link: LINK_STATUS };
export type IndexMap = Map<string, { arrName: 'bluetooth' | 'linked'; index: number }>;

// 连接状态
export enum LINK_STATUS {
    UNCONNECTED = 0,
    ON_CONNECTION = 1,
    CONNECTED = 2,
}

export const STORGET_KEY_SUFFIX = '__bluetooth';
