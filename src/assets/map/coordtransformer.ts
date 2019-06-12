/**
 * 将真实坐标转化为地图坐标
 */
/// <reference path="../../types/fengmap.d.ts" />

export class CoordTransformer {
    public static getVectorLen(v: Vector23) {
        if (v.z == null) {
            v.z = 0;
        }

        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    private mapAxisX!: Vector2;
    private mapAxisY!: Vector2;

    private mapRange!: Vector2;
    private mapOrigion!: Vector2;

    constructor(
        private locOrigion: Vector2,
        private locRange: Vector2,
        mapParas: [Vector2, Vector2, Vector2, Vector2]
    ) {
        if (mapParas.length !== 4) {
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
        const offstRatio = {
            x: (loc.x - this.locOrigion.x) / this.locRange.x,
            y: (loc.y - this.locOrigion.y) / this.locRange.y
        };

        const mapOffset = {
            x: offstRatio.x * this.mapRange.x,
            y: offstRatio.y * this.mapRange.y
        };

        return {
            x: this.mapOrigion.x + this.mapAxisX.x * mapOffset.x + this.mapAxisY.x * mapOffset.y,
            y: this.mapOrigion.y + this.mapAxisX.y * mapOffset.x + this.mapAxisY.y * mapOffset.y
        };
    }
}

export function coodXy(
    v: Vector23,
    locOrigion: Vector2,
    locRange: Vector2,
    mapParas: [Vector2, Vector2, Vector2, Vector2]
): Vector3 {
    const trasformer = new CoordTransformer(locOrigion, locRange, mapParas);

    const mapCoord = trasformer.transform(v);
    mapCoord.z = v.z == null ? 1 : v.z;

    return <Vector3>mapCoord;
}
