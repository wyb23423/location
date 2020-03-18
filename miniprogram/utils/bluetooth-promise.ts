/**
 * @format
 * @file 项目中使用到的wx bluetooth api的Promse形式
 */

// ===========================================================================
type BluetoothError = Promise<WechatMiniprogram.BluetoothError>;
type StartDiscoveryOption = WechatMiniprogram.StartBluetoothDevicesDiscoveryOption;
type GetConnectedOption = WechatMiniprogram.GetConnectedBluetoothDevicesOption;
type GetConnectedResult = Promise<WechatMiniprogram.GetConnectedBluetoothDevicesSuccessCallbackResult>;
type GetBluetoothDevicesResult = Promise<WechatMiniprogram.GetBluetoothDevicesSuccessCallbackResult>;
type GetBluetoothAdapterStateResult = Promise<WechatMiniprogram.GetBluetoothAdapterStateSuccessCallbackResult>;

export function openBluetoothAdapter(): BluetoothError {
    return new Promise((success, fail) => wx.openBluetoothAdapter({ success, fail }));
}

export function startBluetoothDevicesDiscovery(options: StartDiscoveryOption): BluetoothError {
    return new Promise((success, fail) => wx.startBluetoothDevicesDiscovery({ ...options, success, fail }));
}

export function stopBluetoothDevicesDiscovery(): BluetoothError {
    return new Promise((success, fail) => wx.stopBluetoothDevicesDiscovery({ success, fail }));
}

export function getConnectedBluetoothDevices(options: GetConnectedOption): GetConnectedResult {
    return new Promise((success, fail) => wx.getConnectedBluetoothDevices({ ...options, success, fail }));
}

export function getBluetoothDevices(): GetBluetoothDevicesResult {
    return new Promise((success, fail) => wx.getBluetoothDevices({ success, fail }));
}

export function getBluetoothAdapterState(): GetBluetoothAdapterStateResult {
    return new Promise((success, fail) => wx.getBluetoothAdapterState({ success, fail }));
}

export function closeBluetoothAdapter(): BluetoothError {
    return new Promise((success, fail) => wx.closeBluetoothAdapter({ success, fail }));
}
