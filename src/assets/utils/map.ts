/**
 * 地图相关
 */
/// <reference path="../../types/fengmap.d.ts">

import { APP_KEY, APP_NAME, MAP_THEME_URL } from '../../config';

export interface MapData {
    id: number;
    name: string;
    filepath: string;
    margin: Array<[number, number]>;
}

export class LocationMap {
    public map?: fengmap.FMMap;

    constructor(data: MapData, dom: HTMLElement) {
        const res = data.filepath.match(/([^\.\/\\]+)\.([a-z]+)$/i);
        if (Array.isArray(res)) {
            isFengMap(res[2])
                ? this.createFengMap(res[1], dom)
                : this.createCanvasMap(data.filepath, dom);
        } else {
            console.error('地图文件错误:' + data.filepath);
        }
    }

    private createFengMap(name: string, dom: HTMLElement) {
        this.map = new fengmap.FMMap({
            // 渲染dom
            container: dom,
            // 地图数据位置
            mapServerURL: '/data/huijinguangchang/',
            // 主题数据位置
            mapThemeURL: MAP_THEME_URL,
            // 设置主题
            defaultThemeName: name,
            // 默认比例尺级别设置为20级
            defaultMapScaleLevel: 22,
            // 开启2维，3维切换的动画显示
            viewModeAnimateMode: false,
            defaultViewMode: fengmap.FMViewMode.MODE_2D,
            // 开发者申请应用下web服务的key
            key: APP_KEY,
            // 开发者申请应用名称
            appName: APP_NAME,
        });

        this.map.openMapById(name);
    }

    private createCanvasMap(bg: string, dom: HTMLElement) {
        //
    }
}

function isFengMap(ext: string) {
    return ext === 'fmap';
}
