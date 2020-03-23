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

export function startBluetoothDevicesDiscovery(option: StartDiscoveryOption): BluetoothError {
    return new Promise((success, fail) => wx.startBluetoothDevicesDiscovery({ ...option, success, fail }));
}

export function stopBluetoothDevicesDiscovery(): BluetoothError {
    return new Promise((success, fail) => wx.stopBluetoothDevicesDiscovery({ success, fail }));
}

export function getConnectedBluetoothDevices(option: GetConnectedOption): GetConnectedResult {
    return new Promise((success, fail) => wx.getConnectedBluetoothDevices({ ...option, success, fail }));
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

// ===========================低功耗蓝牙
type ConnectOption = WechatMiniprogram.CreateBLEConnectionOption;
type ClosOption = WechatMiniprogram.CloseBLEConnectionOption;
type NotifyValueChangeOption = WechatMiniprogram.NotifyBLECharacteristicValueChangeOption;
type GetServicesOption = WechatMiniprogram.GetBLEDeviceServicesOption;
type GetServicesResult = Promise<WechatMiniprogram.GetBLEDeviceServicesSuccessCallbackResult>;
type GetCharacteristicsOption = WechatMiniprogram.GetBLEDeviceCharacteristicsOption;
type GetCharacteristicsResult = Promise<WechatMiniprogram.GetBLEDeviceCharacteristicsSuccessCallbackResult>;
type WriteOption = WechatMiniprogram.WriteBLECharacteristicValueOption;
type ReadOption = WechatMiniprogram.ReadBLECharacteristicValueOption;

export function createBLEConnection(option: ConnectOption): BluetoothError {
    return new Promise((success, fail) => wx.createBLEConnection({ ...option, success, fail }));
}

export function closeBLEConnection(option: ClosOption): BluetoothError {
    return new Promise((success, fail) => wx.closeBLEConnection({ ...option, success, fail }));
}

export function notifyBLECharacteristicValueChange(option: NotifyValueChangeOption): BluetoothError {
    return new Promise((success, fail) => wx.notifyBLECharacteristicValueChange({ ...option, success, fail }));
}

export function getBLEDeviceServices(option: GetServicesOption): GetServicesResult {
    return new Promise((success, fail) => wx.getBLEDeviceServices({ ...option, success, fail }));
}

export function getBLEDeviceCharacteristics(option: GetCharacteristicsOption): GetCharacteristicsResult {
    return new Promise((success, fail) => wx.getBLEDeviceCharacteristics({ ...option, success, fail }));
}

export function writeBLECharacteristicValue(option: WriteOption): BluetoothError {
    return new Promise((success, fail) => wx.writeBLECharacteristicValue({ ...option, success, fail }));
}

export function readBLECharacteristicValue(option: ReadOption): BluetoothError {
    return new Promise((success, fail) => wx.readBLECharacteristicValue({ ...option, success, fail }));
}
