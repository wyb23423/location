/**
 * 地图相关
 */
import { FengMapMgr } from './fengmap';

// ===================================类型
export interface MapData {
    id: number;
    name: string;
    filepath: string;
    margin: Array<[number, number]>;
}

export interface ZoneData {
    status?: string;
    enable: 0 | 1;
    id?: number;
    name: string;
    position: Vector2[] | string;
}
// ============================================


/**
 * 创建地图
 */
export function createMap(data: MapData, dom: HTMLElement) {
    const res = data.filepath.match(/([^\.\/\\]+)\.([a-z]+)$/i);

    if (Array.isArray(res)) {
        const map = new FengMapMgr(res[1], dom);
        map.margin = <[Vector2, Vector2, Vector2, Vector2]>data.margin.map(v => ({ x: v[0], y: v[1] }));

        // isFengMap(res[2])
        //     ? this.createFengMap(res[1], dom)
        //     : this.createCanvasMap(data.filepath, dom);

        return map;
    } else {
        console.error('地图文件错误:' + data.filepath);
    }
}

function isFengMap(ext: string) {
    return ext === 'fmap';
}
