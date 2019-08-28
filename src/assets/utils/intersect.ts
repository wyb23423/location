/**
 * 判断两条线段是否相交
 */
export default function segmentsIntersect(a1: Vector3, a2: Vector3, b1: Vector3, b2: Vector3) {
    const t1 = cross(a1, a2, b1);
    const t2 = cross(a1, a2, b2);
    const t3 = cross(b1, b2, a1);
    const t4 = cross(b1, b2, a2);
    if (((t1 * t2) > 0) || ((t3 * t4) > 0)) {    // 一条线段的两个端点在另一条线段的同侧，不相交。（可能需要额外处理以防止乘法溢出，视具体情况而定。）
        return { isCollinear: false, result: false };
    } else if (t1 === 0 && t2 === 0) {             // 两条线段共线，利用快速排斥实验进一步判断。此时必有 t3 == 0 && t4 == 0。
        return { isCollinear: true, result: rectsIntersect(a1, a2, b1, b2) };
    } else {                                    // 其它情况，两条线段相交。
        return { isCollinear: false, result: true };
    }
}

/**
 * 计算两个向量的外积（叉乘）。可以根据结果的符号判断三个点的位置关系
 *
 * @returns
 *  向量AC与向量AB的外积。如果结果为正数，表明点C在直线AB（直线方向为从A到B）的右侧；
 *  如果结果为负数，表明点C在直线AB（直线方向为从A到B）的左侧；如果结果为0，表明点C在直线AB上
 */
function cross(a: Vector3, b: Vector3, c: Vector3) {
    return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
}

/**
 * 快速排斥实验，判断两个线段张成的矩形区域是否相交。
 * @returns 两个线段张成的矩形区域是否相交。具有对称性，即交换两条线段（参数S1与S2交换、E1与E2交换），结果不变
 */
function rectsIntersect(s1: Vector3, e1: Vector3, s2: Vector3, e2: Vector3) {
    return Math.min(s1.y, e1.y) <= Math.max(s2.y, e2.y)
        && Math.max(s1.y, e1.y) >= Math.min(s2.y, e2.y)
        && Math.min(s1.x, e1.x) <= Math.max(s2.x, e2.x)
        && Math.max(s1.x, e1.x) >= Math.min(s2.x, e2.x);
}
