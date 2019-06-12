/**
 * 地图相关
 */
import { FengMapMgr } from './fengmap';
import { MapData } from './map';

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
