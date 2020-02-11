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
    const res = data.filepath.match(/([^\/\\]+)\.([a-z]+)$/i);

    if (Array.isArray(res)) {
        return isFengMap(res[2])
            ? new FengMapMgr(res[1], dom, data.margin)
            : new PIXIMgr(data.filepath, dom, data.margin);
    }

    console.error('地图文件错误:' + data.filepath);
}

export function createHeatMap(mgr: FengMapMgr | PIXIMgr) {
    const config: HeatMapConfig = {};
    if (mgr instanceof FengMapMgr) {
        return new FMHeatMap({ ...config, map: mgr.map });
    }

    const { _width, _height } = <any>mgr.stage;
    config.radius = Math.min(_width, _height) / 10;
    return new PXHeatMap(config);
}


function isFengMap(ext: string) {
    return ext === 'fmap';
}
