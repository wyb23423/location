/**
 * fengmap
 */
/// <reference path="../../types/fengmap.d.ts" />

import { MAP_THEME_URL, APP_KEY, APP_NAME, MAP_DATA_URL } from '@/config';
import { randomNum, randomColor, none } from '../utils/util';
import { parsePosition } from './coordtransformer';

export class FengMapMgr {
    public readonly has3D: boolean = true;

    public map!: fengmap.FMMap;

    public margin?: TPosition;
    public locOrigion: Vector2 = { x: 0, y: 0 };
    public locRange: Vector2 = { x: 3073, y: 2326 };

    private markers: Array<fengmap.FMMarker<any>> = [];
    private polygonLayer?: fengmap.FMMarkerLayer<fengmap.FMPolygonMarker>;
    private textLayer?: fengmap.FMMarkerLayer<fengmap.FMTextMarker>;
    private imgLayer?: fengmap.FMMarkerLayer<fengmap.FMImageMarker>;

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

        const zones: Vector2[] = typeof data.position === 'string' ? JSON.parse(data.position) : data.position;
        const height = this.createPolygonMarker(zones, data.name);
        this.addTextMarker({ ...zones[0], height }, data.name);
    }

    /**
     * 移除marker
     */
    public remove(name?: string | number) {
        if (name == null) {
            if (this.textLayer) {
                this.textLayer.removeAll();
            }
            if (this.imgLayer) {
                this.imgLayer.removeAll();
            }
            if (this.polygonLayer) {
                this.polygonLayer.removeAll();
            }

            this.markers.length = 0;
        } else {
            this.eachmarkers(
                (layer: fengmap.FMMarkerLayer<any>, i: number) => {
                    layer.removeMarker(this.markers.splice(i, 1)[0]);

                    return i - 1;
                },
                name
            );
        }

    }

    public on(type: string, callback: any) {
        this.map.on(type, callback);
    }

    public addImage(
        opt: any,
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
        this.markers.push(im);

        return p;
    }

    public createPolygonMarker(coords: Vector2[], name: string, isMapCoor: boolean = false) {
        if (!this.margin) {
            console.error('地图范围为空');

            return 0;
        }

        let coordslist = coords;
        if (!isMapCoor) {
            coordslist = coords.map(v => parsePosition(v, this.locOrigion, this.locRange, this.margin!));
        }

        const group = this.map.getFMGroup(this.map.groupIDs[0]);
        // 返回当前层中第一个polygonMarker,如果没有，则自动创建
        this.polygonLayer = group.getOrCreateLayer<fengmap.FMPolygonMarker>('polygonMarker');

        const height = randomNum(3, 6);

        const polygonMarker = new fengmap.FMPolygonMarker({
            color: randomColor(),
            alpha: 0.5,
            lineWidth: 1,
            height,
            // 设置多边形坐标点
            points: coordslist
        });
        polygonMarker.custom = { name };

        this.polygonLayer.addMarker(polygonMarker);

        this.markers.push(polygonMarker);

        return height;
    }

    public addTextMarker(
        coord: Vector2 | any,
        name: string,
        isMapCoor: boolean = false
    ): Promise<any> {
        if (!this.margin) {
            return Promise.reject('地图范围为空');
        }

        if (!this.map) {
            return Promise.reject('获取地图失败');
        }

        let newlist = {
            x: coord.x,
            y: coord.y
        };

        if (!isMapCoor) {
            newlist = parsePosition(coord, this.locOrigion, this.locRange, this.margin!);
        }

        const group = this.map.getFMGroup(this.map.focusGroupID);

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

            tm.custom = {
                name: 'text: ' + name,
                opt: coord
            };

            tm.height = coord.height || 0;

            // 文本标注层添加文本Marker
            this.textLayer!.addMarker(tm);
            this.markers.push(tm);
        });
    }

    public dispose() {
        // this.remove();
        this.map.dispose();
        Reflect.set(this, 'map', null);

        this.polygonLayer = this.imgLayer = this.textLayer = undefined;
    }

    // 移动marker
    public moveTo(
        name: string | number,
        coord: Vector23,

        time: number = 1,
        update?: (v: Vector2) => void,
        // tslint:disable-next-line: ban-types
        callback?: Function,
        isMapCoor: boolean = false,
    ) {
        if (!isMapCoor) {
            coord = parsePosition(coord, this.locOrigion, this.locRange, this.margin!);
        }

        this.eachmarkers((layer, i) => {
            this.markers[i].moveTo({
                time,
                x: coord.x,
                y: coord.y,

                callback: callback || none,
                update: (v: Vector2) => {
                    if (update && this.map) {
                        update(this.map.coordMapToScreen(v.x, v.y));
                    }
                }
            });
        }, name);
    }

    // 2D与3D切换
    public switchViewMode() {
        // ===============================处理切换时文字显示bug(已修复)
        // const textOpts: any[] = [];
        // if (this.textLayer) {
        //     this.textLayer.textMarkers.forEach(v => {
        //         textOpts.push({
        //             name: v.name,
        //             coord: Object.assign({}, (v.custom || {}).opt || {}, {
        //                 x: v._x,
        //                 y: v._y,
        //                 height: v.height
        //             })
        //         });
        //     });

        //     this.textLayer.removeAll();
        // }
        // ===============================

        if (this.map.viewMode === fengmap.FMViewMode.MODE_2D) {
            this.map.viewMode = fengmap.FMViewMode.MODE_3D;
        } else {
            this.map.viewMode = fengmap.FMViewMode.MODE_2D;
        }

        // ===============================处理切换时文字显示bug(已修复)
        // setTimeout(() => {
        //     textOpts.forEach(v => this.addTextMarker(v.coord, v.name, true));
        //     textOpts.length = 0;
        // }, 200);
        // ===============================
    }

    public show(name?: string | number, isShow?: boolean) {
        this.eachmarkers((layer: any, i: number) => {
            const marker = this.markers[i];
            marker.show = isShow == null ? !marker.show : isShow;
        }, name);
    }

    private eachmarkers(
        func: (layer: fengmap.FMMarkerLayer<any>, i: number) => number | void,
        name?: string | number
    ) {
        let layer: fengmap.FMMarkerLayer<any> | undefined;

        for (let i = 0; i < this.markers.length; i++) {
            const v = this.markers[i];

            if (name == null || v.custom && v.custom.name === name) {
                if (v instanceof fengmap.FMPolygonMarker) {
                    layer = this.polygonLayer;
                } else if (v instanceof fengmap.FMImageMarker) {
                    layer = this.imgLayer;
                }
            }

            if (v instanceof fengmap.FMTextMarker
                && (
                    name == null
                    || v.custom && v.custom.name === 'text: ' + name
                )
            ) {
                layer = this.textLayer;
            }

            if (layer) {
                const index: number | void = func.call(this, layer, i);

                if (index != null) {
                    i = index;
                }

                layer = undefined;
            }
        }
    }
}
