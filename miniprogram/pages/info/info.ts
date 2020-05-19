/** @format */
import * as Bluetooth from '../../utils/bluetooth-promise';
import { STORGET_KEY_SUFFIX } from '../../constant/const';
import createRecycleContext from 'miniprogram-recycle-view';
import { ab2hex, string2buffer } from '../../utils/util';
import ERROR_INFO from '../../constant/error';

type CharacteristicType = 'read' | 'write' | 'notify';

const BLE_UUID_DW1000_SERVICE = '0000DECA-0000-1000-8000-00805F9B34FB';
const BLE_UUID_DW1001_STADIOMETRY = '00001001-0000-1000-8000-00805F9B34FB';
const BLE_UUID_DW1001_ORDER = '00001002-0000-1000-8000-00805F9B34FB';

Page({
    deviceId: '', // 设备deviceId
    uuid: new Map<CharacteristicType, string[]>(),
    listener: null as null | WechatMiniprogram.OnBLECharacteristicValueChangeCallback,
    ctx: null as ReturnType<typeof createRecycleContext> | null,
    data: {
        name: '',
        messages: [] as { no: string; distance: number }[],
        scrollTop: 0,
    },
    onLoad({ id, name }) {
        if (!(id && name)) {
            return wx.navigateBack();
        }

        this.setData({ name });
        this._init(id);

        this.ctx = createRecycleContext({
            id: 'content',
            dataKey: 'messages',
            page: this,
            itemSize: () => {
                const obj = { width: 0, height: 0 };
                if (this.ctx) {
                    obj.width = this.ctx.transformRpx(660);
                    obj.height = this.ctx.transformRpx(80);
                }

                return obj;
            },
        });
    },
    onUnload() {
        // 取消监听低功耗蓝牙设备的特征值变化事件。
        this.listener && wx.offBLECharacteristicValueChange(this.listener);
        this.uuid.clear();
        this.listener = this.ctx = null;
    },
    cancelMatch() {
        wx.removeStorage({ key: this.deviceId + STORGET_KEY_SUFFIX });

        const pages = getCurrentPages();
        pages[pages.length - 2].cancelConnection(this.deviceId);

        wx.navigateBack();
    },
    send({ detail: { value } }: BaseEvent<{}, {}, {}, { value: string }>) {
        if (!value) {
            return;
        }

        const write = this.uuid.get('write');
        if (!write) {
            return wx.showModal({
                title: '提示',
                content: '当前设备不可写!',
                showCancel: false,
            });
        }

        Bluetooth.writeBLECharacteristicValue({
            deviceId: this.deviceId,
            characteristicId: write[0],
            serviceId: write[1],
            value: string2buffer(value),
        }).catch((res: WechatMiniprogram.BluetoothError) => {
            wx.showModal({
                title: '提示',
                content: ERROR_INFO.get(res.errCode) || res.errMsg,
                showCancel: false,
            });
        });
    },
    async _init(deviceId: string) {
        this.deviceId = deviceId;

        try {
            const { services } = await Bluetooth.getBLEDeviceServices({ deviceId });
            const arr = [];
            for (const v of services) {
                if (v.uuid === BLE_UUID_DW1000_SERVICE) {
                    arr.push(this._UUID(v.uuid, deviceId));
                }
            }
            await Promise.all(arr);
        } catch (e) {
            return;
        }

        this._applyEvents();
    },
    async _applyEvents() {
        const notify = this.uuid.get('notify');
        if (!notify) {
            return;
        }

        await Bluetooth.notifyBLECharacteristicValueChange({
            deviceId: this.deviceId,
            characteristicId: notify[0],
            serviceId: notify[1],
            state: true,
        });

        this.listener = ({ value }): void => {
            if (!this.ctx) {
                return;
            }

            const data = ab2hex(value);
            const no = data.slice(0, -4);
            const distance = this._hexstr2num(data.slice(-4));
            const index = this.data.messages.findIndex(v => v.no === no);
            if (index > -1) {
                this.ctx.splice(index, 1, [{ no, distance }]);
            } else {
                this.ctx.append([{ no, distance }]);
            }
        };

        wx.onBLECharacteristicValueChange(this.listener);
    },
    async _UUID(serviceId: string, deviceId: string) {
        const { characteristics } = await Bluetooth.getBLEDeviceCharacteristics({ deviceId, serviceId });
        for (const { uuid, properties } of characteristics) {
            if (this.uuid.size >= 3) {
                return;
            }

            if (!this.uuid.has('read') && properties.read) {
                this.uuid.set('read', [uuid, serviceId]);
            }

            if (!this.uuid.has('write') && properties.write && uuid === BLE_UUID_DW1001_ORDER) {
                this.uuid.set('write', [uuid, serviceId]);
            }

            if (
                !this.uuid.has('notify') &&
                (properties.notify || properties.indicate) &&
                uuid === BLE_UUID_DW1001_STADIOMETRY
            ) {
                this.uuid.set('notify', [uuid, serviceId]);
            }
        }
    },
    _hexstr2num(code: string) {
        const arr = new Uint8Array(1);
        arr[0] = +`0x${code}`;

        return arr[0];
    },
});
