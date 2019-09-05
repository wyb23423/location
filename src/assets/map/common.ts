/**
 * 获取元素的自定义属性
 */
export function getCustomInfo(el: any, key: string) {
    el.custom = el.custom || {};
    el.custom[key] = el.custom[key] || {};

    return el.custom[key];
}

export const DEFAULT_HEATMAP_CONFIG = {
    gradient: {
        0.45: 'rgb(201,135,255)',
        0.55: 'rgb(189,97,255)',
        0.65: 'rgb(155,49,255)',
        0.95: 'yellow',
        1.0: 'rgb(157,53,255)'
    },
    opacity: 1,
    min: 0,
    max: 100,
    radius: 20
};
