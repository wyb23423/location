/**
 * 将实际坐标与地图坐标相互转化
 */
/// <reference path="../../types/fengmap.d.ts" />

export class CoordTransformer {
    public static getVectorLen(v: Vector23) {
        if (v.z == null) {
            v.z = 0;
        }

        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    public mapRange: Vector2 = { x: 0, y: 0 }; // 映射地图大小
    public mapOrigion: Vector2 = { x: 0, y: 0 }; // 地图包围盒左下角坐标(映射)

    private mapAxisX: Vector2 = { x: 0, y: 0 }; // x轴单位向量
    private mapAxisY: Vector2 = { x: 0, y: 0 }; // y轴单位向量

    constructor(
        private locOrigion: Vector2,
        private locRange: Vector2,
        mapParas: [Vector2, Vector2, Vector2, Vector2]
    ) {
        if (mapParas.length < 4) {
            console.error('地图顶点数量需要为4');
        } else {
            this.mapOrigion = mapParas[0];

            const mapAxisX = this.mapAxisX = { x: mapParas[3].x - mapParas[0].x, y: mapParas[3].y - mapParas[0].y };
            const mapAxisY = this.mapAxisY = { x: mapParas[1].x - mapParas[0].x, y: mapParas[1].y - mapParas[0].y };
            const mapRange = this.mapRange = {
                x: CoordTransformer.getVectorLen(this.mapAxisX),
                y: CoordTransformer.getVectorLen(this.mapAxisY)
            };

            // 向量单位化
            mapAxisX.x /= mapRange.x;
            mapAxisX.y /= mapRange.x;
            mapAxisY.x /= mapRange.y;
            mapAxisY.y /= mapRange.y;
        }
    }

    public transform(loc: Vector2): Vector23 {
        const offsetRatio = {
            x: (loc.x - this.locOrigion.x) / this.locRange.x,
            y: (loc.y - this.locOrigion.y) / this.locRange.y
        };

        const mapOffset = {
            x: offsetRatio.x * this.mapRange.x,
            y: offsetRatio.y * this.mapRange.y
        };

        return {
            x: this.mapOrigion.x + this.mapAxisX.x * mapOffset.x + this.mapAxisY.x * mapOffset.y,
            y: this.mapOrigion.y + this.mapAxisX.y * mapOffset.x + this.mapAxisY.y * mapOffset.y
        };
    }
}

/**
 * 将实际坐标转化为地图坐标
 * @param v 需要转换的实际坐标
 * @param locOrigion 原点(实际坐标)
 * @param locRange 地图显示大小
 * @param mapParas 地图包围盒实际坐标
 */
export function parsePosition(
    v: Vector23,
    locOrigion: Vector2,
    locRange: Vector2,
    mapParas: [Vector2, Vector2, Vector2, Vector2]
): Vector3 {
    const transformer = new CoordTransformer(locOrigion, locRange, mapParas);

    const mapCoord = transformer.transform(v);
    mapCoord.z = v.z == null ? 1 : v.z;

    return <Vector3>mapCoord;
}

/**
 * 将地图坐标转化为实际坐标
 */
export function getCoordinate(
    v: Vector23,
    locOrigion: Vector2,
    locRange: Vector2,
    mapParas: [Vector2, Vector2, Vector2, Vector2]
) {
    const tmp = new CoordTransformer(locOrigion, locRange, mapParas);
    const transformer = new CoordTransformer(tmp.mapOrigion, tmp.mapRange, [
        { x: 0, y: 0 },
        { x: 0, y: locRange.y },
        { x: locRange.x, y: locRange.y },
        { x: locRange.x, y: 0 }
    ]);

    const mapCoord = transformer.transform(v);
    mapCoord.z = v.z == null ? 1 : v.z;

    return <Vector3>mapCoord;
}
