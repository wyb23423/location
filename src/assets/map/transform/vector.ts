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

    constructor(x: number = 0, y: number = x, public z: number = 1) { super(x, y); }

    public clone() {
        return Vector.create(this);
    }

    public copyFrom(vec: Vector) {
        super.copyFrom(vec);
        this.z = vec.z;

        return this;
    }

    public copyTo(vec: Vector) {
        return vec.copyFrom(this);
    }

    public equals(vec: Vector) {
        return super.equals(vec) && this.z === vec.z;
    }

    public set(x?: number, y?: number, z?: number) {
        super.set(x, y);
        this.z = z ?? this.z;

        return this;
    }
}
