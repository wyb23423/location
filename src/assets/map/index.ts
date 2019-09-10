/**
 * 地图相关
 */
import { FengMapMgr } from './fengmap';
import { PIXIMgr } from './pixi';
import FMHeatMap from './fengmap/heat_map';
import PXHeatMap from './pixi/heat_map';


/**
 * 创建地图
 */
export function createMap(data: IMap, dom: HTMLElement) {
    const res = data.filepath.match(/([^\.\/\\]+)\.([a-z]+)$/i);

    if (Array.isArray(res)) {
        const map = isFengMap(res[2]) ? new FengMapMgr(res[1], dom) : new PIXIMgr(data.filepath, dom);
        map.margin = <TPosition>(<number[][]>data.margin).map(v => ({ x: v[0], y: v[1] }));
        map.locRange = {
            x: <number>data.margin[4][0],
            y: <number>data.margin[4][1]
        };

        return map;
    } else {
        console.error('地图文件错误:' + data.filepath);
    }
}

export function createHeatMap(mgr: FengMapMgr | PIXIMgr) {
    if (mgr instanceof FengMapMgr) {
        return new FMHeatMap({ map: mgr.map });
    }

    return new PXHeatMap();
}


function isFengMap(ext: string) {
    return ext === 'fmap';
}
