/**
 * 基站补偿值算法
 */

// 光速
const c: number = 29970254700;

/**
 * 计算主基站补偿值
 * @param base 基站坐标
 * @param tag 标签坐标
 * @param t0 主基站时间
 */
export function major(base: Vector3, tag: Vector3, t0: number) {
    return t0 - 2 * distance(base, tag) / c;
}

/**
 * 计算从基站补偿值
 * @param base 从基站坐标
 * @param tag 标签坐标
 * @param main 主基站坐标
 * @param t0 主基站时间
 * @param t 从基站时间
 */
export function subordinate(base: Vector3, tag: Vector3, main: Vector3, t0: number, t: number) {
    const x1 = distance(main, tag);
    const x2 = distance(base, tag);
    const x3 = distance(main, base);

    return t0 - t + (x2 - x1 - x3) / c;
}


function distance(p1: Vector3, p2: Vector3) {
    return ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2) ** 1 / 2;
}
