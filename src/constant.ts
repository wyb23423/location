/**
 * 配置及常量
 */
// 主题数据位置
export const MAP_THEME_URL: string = '/data/theme';
// 地图数据位置
export const MAP_DATA_URL: string = '/data/huijinguangchang';

export const DEFAULT_WIDTH: number = 1600; // 屏幕默认宽度
export const SX_WIDTH: number = 768; // 小屏宽度
export const LOSS_TIME: number = 10000; // 用于判断信号是否丢失

export const NOTICE_MAX: number = 3; // 同时出现的最大报警数
export const MISS_MSG: string = '信号丢失'; // 标签信号丢失时的报警信息
export const NOTIFY_KEY = Symbol('NOTIFY_KEY'); // 触发警报提示的全局事件名
export const MODIFY_TAG_ICON = Symbol('MODIFY_TAG_ICON'); // 修改标签图标的全局事件名

// 全部权限
export const ALL_PERMISSION = {
    admin: { put: true, delete: true, post: true, get: true }, // 管理员
    fence: { put: true, delete: true, post: true, get: true }, // 区域(电子围栏)
    camera: { put: true, delete: true, post: true, get: true }, // 摄像机
    protocol: { put: true, delete: true, post: true, get: true }, // 协议
    base: { put: true, delete: true, post: true, get: true }, // 设备(基站)
    people: { put: true, delete: true, post: true, get: true }, // 人员(标签)
    map: { put: true, delete: true, post: true, get: true }, // 地图(监控)
    alarm: { put: true, delete: true, post: true, get: true } // 报警信息
};

// 开发者申请应用下web服务的key
export let APP_KEY: string = '83a75157d56ffe85317ed7ba1e8120ff';
// 开发者申请应用名称
export let APP_NAME: string = 'hunjingguanchang';
// 服务器地址
export let BASE_URL = process.env.BASE_URL;

/**
 * 初始化配置
 */
export function initConfig() {
    return fetch('/config.json')
        .then(res => res.json())
        .then(res => {
            APP_KEY = res.APP_KEY;
            APP_NAME = res.APP_NAME;
            if (process.env.NODE_ENV !== 'production') {
                BASE_URL = res.PROXY_TARGET;
            }

            sessionStorage.setItem('config', JSON.stringify(res));
        })
        .catch(console.error);
}
