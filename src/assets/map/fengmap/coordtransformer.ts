import { getConfig } from '@/assets/utils/util';
import { adaptationVector } from '../common';

/**
 * 将实际坐标与地图坐标相互转化
 */
interface TransformOptions {
    locOrigion: Vector2;
    mapOrigin: Vector2;
    locRange: Vector2;
    mapRange: Vector2;
    mapAxisX: Vector2;
    mapAxisY: Vector2;
}

export class CoordTransformer {

    public set locRange(data: Vector2) {
        if (!this._locRange) {
            this._locRange = data;
        } else {
            console.error('地图范围只能设置一次');
        }
    }
    public static getVectorLen(v: Vector23) {
        if (v.z == null) {
            v.z = 0;
        }

        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    public margin?: TPosition; // 地图大小（实际）
    public locOrigion: Vector2 = { x: 0, y: 0 };
    public mapRange: Vector2 = { x: 0, y: 0 }; // 映射地图大小

    // tslint:disable-next-line: variable-name
    private _locRange?: Vector2;
    private mapAxisX: Vector2 = { x: 0, y: 0 }; // x轴单位向量
    private mapAxisY: Vector2 = { x: 0, y: 0 }; // y轴单位向量

    private isInit: boolean = true; // 是否未计算过定位坐标转地图坐标时需要的参数

    public parseCood(data: Vector23 | Vector23[]) {
        if (this._locRange && this.margin) {
            if (Array.isArray(data)) {
                return data.map(this.transform.bind(this));
            }

            return this.transform(data);
        }

        console.error('地图范围错误');
    }

    /**
     * 计算坐标转换需要的参数
     */
    public parseTransform(mapParas: TPosition | undefined = this.margin) {
        if (!mapParas || mapParas.length < 4) {
            console.error('地图顶点数量需要为4');
        } else {
            const mapAxisX = { x: mapParas[3].x - mapParas[0].x, y: mapParas[3].y - mapParas[0].y };
            const mapAxisY = { x: mapParas[1].x - mapParas[0].x, y: mapParas[1].y - mapParas[0].y };
            const mapRange = {
                x: CoordTransformer.getVectorLen(mapAxisX),
                y: CoordTransformer.getVectorLen(mapAxisY)
            };

            // 向量单位化
            mapAxisX.x /= mapRange.x;
            mapAxisX.y /= mapRange.x;
            mapAxisY.x /= mapRange.y;
            mapAxisY.y /= mapRange.y;

            return {
                mapAxisX,
                mapAxisY,
                mapRange
            };
        }
    }


    /**
     * 将定位坐标转为地图坐标
     */
    public transform(loc: Vector23): Vector3 {
        if (!this.valid()) {
            return { x: 0, y: 0, z: 0 };
        }

        if (this.isInit) {
            const params = this.parseTransform();

            if (params) {
                Object.assign(this, params);
                this.isInit = false;
            }
        }

        const { x, y } = getConfig('adjust', { x: 0, y: 0 });
        loc = adaptationVector(loc);
        loc.x += x;
        loc.y += y;

        return this._transform(
            loc,
            {
                mapOrigin: this.margin![0],
                mapAxisX: this.mapAxisX,
                mapAxisY: this.mapAxisY,
                mapRange: this.mapRange,
                locRange: <Vector2>this._locRange,
                locOrigion: this.locOrigion
            }
        );
    }

    /**
     * 将地图坐标转化为定位坐标
     */
    public getCoordinate(v: Vector23): Vector3 {
        if (!this.valid()) {
            return { x: 0, y: 0, z: 0 };
        }

        // tslint:disable-next-line:variable-name
        let _this: any = this;
        if (this.isInit) {
            _this = this.parseTransform();
        }

        const locRange = <Vector2>this._locRange;
        const tmp = this.parseTransform([
            { x: 0, y: 0 },
            { x: 0, y: locRange.y },
            { x: locRange.x, y: locRange.y },
            { x: locRange.x, y: 0 }
        ]);

        const result = this._transform(
            adaptationVector(v),
            {
                mapOrigin: { x: 0, y: 0 },
                locRange: _this.mapRange,
                locOrigion: this.margin![0],
                mapAxisX: tmp!.mapAxisX,
                mapAxisY: tmp!.mapAxisY,
                mapRange: tmp!.mapRange
            }
        );
        const { x, y } = getConfig('adjust', { x: 0, y: 0 });
        result.x -= x;
        result.y -= y;

        return result;
    }

    /**
     * 坐标转换
     * @param options.locOrigion 原始坐标系 原点
     * @param options.mapOrigin 映射坐标原点
     * @param options.mapAxisX 映射坐标系 X轴单位向量
     * @param options.mapAxisY 映射坐标系 Y轴单位向量
     * @param options.locRange 原始地图范围
     * @param options.mapRange 映射地图范围
     */
    private _transform({ x, y, z }: Vector23, options: TransformOptions) {
        const { mapOrigin, mapAxisX, mapAxisY, locOrigion, locRange, mapRange } = options;

        const offsetX = (x - locOrigion.x) / locRange.x * mapRange.x;
        const offsetY = (y - locOrigion.y) / locRange.y * mapRange.y;

        return {
            x: mapOrigin.x + mapAxisX.x * offsetX + mapAxisY.x * offsetY,
            y: mapOrigin.y + mapAxisX.y * offsetX + mapAxisY.y * offsetY,
            z: z == null ? 1 : z
        };
    }

    private valid() {
        if (!this.margin) {
            console.error('获取映射地图范围失败!');
            return false;
        }

        if (!this._locRange) {
            console.error('获取原始地图范围失败!');
            return false;
        }

        return true;
    }
}
