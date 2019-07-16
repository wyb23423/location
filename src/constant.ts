/**
 * 配置及常量
 */

// 服务器地址
export const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : 'http://localhost/';

// 主题数据位置
export const MAP_THEME_URL: string = '/data/theme';
// 地图数据位置
export const MAP_DATA_URL: string = '/data/huijinguangchang/';

export const DEFAULT_WIDTH: number = 1600; // 屏幕默认宽度
export const SX_WIDTH: number = 768; // 小屏宽度
export const LOSS_TIME: number = 10000; // 用于判断信号是否丢失

// 开发者申请应用下web服务的key
export let APP_KEY: string = '83a75157d56ffe85317ed7ba1e8120ff';
// 开发者申请应用名称
export let APP_NAME: string = 'hunjingguanchang';

/**
 * 初始化配置
 */
export function initConfig() {
    return fetch('/config.json')
        .then(res => res.json())
        .then(res => {
            APP_KEY = res.APP_KEY;
            APP_NAME = res.APP_NAME;
            sessionStorage.setItem('config', JSON.stringify(res));
        })
        .catch(console.error);
}
