export const HEAD = [0x23]; // 协议包头
export const END = [0x0D, 0x0A]; // 协议包尾

export const DEVICE_PIXEL_RATIO = Math.max(2, window.devicePixelRatio);

// 开发者申请应用下web服务的key
export let APP_KEY: string = '83a75157d56ffe85317ed7ba1e8120ff';
// 开发者申请应用名称
export let APP_NAME: string = 'hunjingguanchang';
// 服务器地址
export let BASE_URL = <string>process.env.BASE_URL;

/**
 * 初始化配置
 */
export async function initConfig() {
    let res: any = await fetch('/config.json');
    res = await res.json();

    APP_KEY = res.APP_KEY;
    APP_NAME = res.APP_NAME;
    if (process.env.NODE_ENV !== 'production') {
        BASE_URL = res.PROXY_TARGET;
    }

    sessionStorage.setItem('config', JSON.stringify(res));
}

export enum ALARM_TYPE {
    IN = 0, // 进入报警
    OUT = 1, // 离开报警
    BASE_OFFLINE = 2, // 基站离线
    SOS = 3, // 标签SOS报警
    STATIC = 4, // 标签静止报警
    HUMMER = 5, // 蜂鸣器报警
    BAND = 6, // 手环断开报警
    TAG_OUT = 7, // 标签消失报警
    BATTERY_LOW = 8, // 电量低报警
    FAR = 9, // 跟随报警,{0}远离了主体:{1}
    BESIDE = 10 // 靠近报警,{0}靠近了主体:{1}
}
