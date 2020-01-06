/**
 * 向量
 */
import { Point } from 'pixi.js';

export class Vector extends Point {

    /**
     * 使用对象创建向量
     */
    public static create(vec: Vector23 | VectorAxis | Array<number | string>) {
        if (Array.isArray(vec)) {
            return new Vector(...vec.map(v => isNaN(+v) ? void 0 : +v));
        }

        const vector: any = { ...vec };
        const x = vector.x || vector.xaxis || 0;
        const y = vector.y || vector.yaxis || 0;
        const z = vector.z || vector.zaxis || 1;

        return new Vector(x, y, z);
    }

    constructor(
        public x: number = 0,
        public y: number = x,
        public z: number = 1
    ) { super(x, y); }
}
