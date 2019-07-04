/**
 * 地图相关
 */
import { FengMapMgr } from './fengmap';
import { PIXIMgr } from './pixi';


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

function isFengMap(ext: string) {
    return ext === 'fmap';
}
