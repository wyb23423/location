/**
 * fengmap
 */
/// <reference path="../../types/fengmap.d.ts" />

import { MAP_THEME_URL, APP_KEY, APP_NAME, MAP_DATA_URL } from '@/config';
import { randomNum, randomColor } from '../utils/util';
import { parsePosition } from './coordtransformer';

export class FengMapMgr {
    public map!: fengmap.FMMap;

    public margin?: [Vector2, Vector2, Vector2, Vector2];
    public locOrigion: Vector2 = { x: 0, y: 0 };
    public locRange: Vector2 = { x: 3073, y: 2326 };

    private makers: Array<fengmap.FMPolygonMarker | fengmap.FMTextMarker | fengmap.FMImageMarker> = [];
    private polygonLayer?: fengmap.FMMakerLayer<fengmap.FMPolygonMarker>;
    private textLayer?: fengmap.FMMakerLayer<fengmap.FMTextMarker>;
    private imgLayer?: fengmap.FMMakerLayer<fengmap.FMImageMarker>;

    constructor(name: string, dom: HTMLElement) {
        this.map = new fengmap.FMMap({
            // 渲染dom
            container: dom,
            // 地图数据位置
            mapServerURL: MAP_DATA_URL,
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

    /**
     * 显示区域
     */
    public zoneOpen(data: IZone) {
        if (!this.margin) {
            return console.error('地图范围为空');
        }

        const zones = <Vector2[]>data.position;
        this.createPolygonMaker(zones, data.name);
        this.addTextMarker(zones[0], data.name);
    }

    /**
     * 隐藏区域
     */
    public remove(name: string | number) {
        let layer: fengmap.FMMakerLayer<any> | null = null;

        for (let i = this.makers.length - 1; i >= 0; i--) {
            const v = this.makers[i];
            if (v instanceof fengmap.FMPolygonMarker) {
                if (v.custom && v.custom.name === name && this.polygonLayer) {
                    layer = this.polygonLayer;
                }
            } else if (v instanceof fengmap.FMTextMarker) {
                if (v.name === name && this.textLayer) {
                    layer = this.textLayer;
                }
            } else if (v instanceof fengmap.FMImageMarker) {
                if (v.custom && v.custom.name === name && this.imgLayer) {
                    layer = this.imgLayer;
                }
            }

            if (layer) {
                layer.removeMarker(this.makers.splice(i, 1)[0]);
                layer = null;
            }
        }
    }

    public on(type: string, callback: any) {
        this.map.on(type, callback);
    }

    public addImage(
        opt: FMImageMarkerOptions,
        name?: string | number,
        gid: number = this.map.focusGroupID,
        isMapCoor: boolean = true
    ) {
        const group = this.map.getFMGroup(gid);

        let p = {
            x: opt.x,
            y: opt.y,
            z: group.groupHeight + this.map.layerLocalHeight
        };

        if (!isMapCoor) {
            p = parsePosition(p, this.locOrigion, this.locRange, this.margin!);
        }

        this.imgLayer = group.getOrCreateLayer('imageMarker');

        const im = new fengmap.FMImageMarker({
            ...opt,
            ...p,
            callback() {
                if (opt.callback) {
                    opt.callback(im);
                }
            }
        });
        im.custom = { name: name || JSON.stringify(p) };

        this.imgLayer.addMarker(im);
        this.makers.push(im);

        return p;
    }

    public createPolygonMaker(coords: Vector2[], name: string, isMapCoor: boolean = false) {
        if (!this.margin) {
            return console.error('地图范围为空');
        }

        let coordslist = coords;
        if (!isMapCoor) {
            coordslist = coords.map(v => parsePosition(v, this.locOrigion, this.locRange, this.margin!));
        }

        const group = this.map.getFMGroup(this.map.groupIDs[0]);
        // 返回当前层中第一个polygonMarker,如果没有，则自动创建
        this.polygonLayer = group.getOrCreateLayer<fengmap.FMPolygonMarker>('polygonMarker');

        const polygonMarker = new fengmap.FMPolygonMarker({
            color: randomColor(),
            alpha: 0.5,
            lineWidth: 1,
            height: randomNum(3, 6),
            // 设置多边形坐标点
            points: coordslist
        });
        polygonMarker.custom = { name };

        this.polygonLayer.addMarker(polygonMarker);

        this.makers.push(polygonMarker);
    }

    public addTextMarker(
        coord: Vector2 | FMTextMarkerOptions,
        name: string,
        isMapCoor: boolean = false
    ): Promise<fengmap.FMTextMarker> {
        if (!this.margin) {
            return Promise.reject('地图范围为空');
        }

        let newlist = {
            x: coord.x,
            y: coord.y
        };

        if (!isMapCoor) {
            newlist = parsePosition(coord, this.locOrigion, this.locRange, this.margin!);
        }

        const group = this.map.getFMGroup(this.map.groupIDs[0]);

        // 返回当前层中第一个textMarkerLayer,如果没有，则自动创建
        this.textLayer = group.getOrCreateLayer('textMarker');

        return new Promise(resolve => {
            // 图标标注对象，默认位置为该楼层中心点
            const tm = new fengmap.FMTextMarker({
                fillcolor: '255,0,0',
                fontsize: 20,
                strokecolor: '255,255,0',
                ...coord,
                name,
                x: newlist.x,
                y: newlist.y,
                callback: () => resolve(tm)
            });

            // 文本标注层添加文本Marker
            this.textLayer!.addMarker(tm);
            this.makers.push(tm);
        });
    }

    public dispose() {
        this.map.dispose();
        Reflect.set(this, 'map', null);
    }
}
