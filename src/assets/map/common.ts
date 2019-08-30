/**
 * 获取元素的自定义属性
 */
export function getCustomInfo(el: any, key: string) {
    el.custom = el.custom || {};
    el.custom[key] = el.custom[key] || {};

    return el.custom[key];
}
