export const HEAD = 0x23; // 协议包头
export const END = 0x0A; // 协议包尾

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
