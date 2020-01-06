import { Matrix } from 'pixi.js';
import { Vector } from './vector';
import { getConfig } from '@/assets/utils/util';

export class Transform {
    private matrix = new Matrix();

    constructor(margin?: number[][]) {
        margin && this.initTransform(margin);
    }

    /**
     * 定位坐标转地图坐标
     */
    public location2map(data: Vector23, adjust: boolean = true) {
        const vec = Vector.create(data);
        return <Vector>this.matrix.apply(adjust ? this.adjust(vec, true) : vec, vec);
    }

    /**
     * 地图坐标转定位坐标
     */
    public map2location(data: Vector23, adjust: boolean = true) {
        const vec = Vector.create(data);
        this.matrix.applyInverse(vec, vec);
        return adjust ? this.adjust(vec, false) : vec;
    }

    // 初始化变换矩阵, 不存在旋转
    protected initTransform([m0, m1, l0, l1]: number[][]) {
        const mx = m1[0] - m0[0];
        const my = m1[1] - m0[1];
        const lx = l1[0] - l0[0];
        const ly = l1[1] - l0[1];

        const tx = m0[0] - l0[0];
        const ty = m0[1] - l0[1];

        this.matrix.set(mx / lx, 0, 0, my / ly, tx, ty);
    }

    // 根据配置的坐标校准值调整坐标
    private adjust(vec: Vector, is2map: boolean) {
        const { x, y } = getConfig('adjust', { x: 0, y: 0 });
        if (is2map) {
            vec.x += x;
            vec.y += y;
        } else {
            vec.x -= x;
            vec.y -= y;
        }

        return vec;
    }
}
