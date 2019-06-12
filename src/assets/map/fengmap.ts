/**
 * fengmap
 */
/// <reference path="../../types/fengmap.d.ts" />

import { MAP_THEME_URL, APP_KEY, APP_NAME } from '@/config';
import { randomNum, randomColor } from '../utils/util';
import { coodXy } from './coordtransformer';
import { MapMgr, ZoneData } from './map';

export class FengMapMgr extends MapMgr<fengmap.FMMap> {
    constructor(name: string, dom: HTMLElement) {
        super();

        this.map = new fengmap.FMMap({
            // 渲染dom
            container: dom,
            // 地图数据位置
            mapServerURL: '/data/huijinguangchang/', // TODO 修改路徑
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
    public zoneOpen(data: ZoneData) {
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
    public removeZone(name: string) {
        for (let i = this.makers.length - 1; i >= 0; i--) {
            const v = this.makers[i];
            if (v instanceof fengmap.FMPolygonMarker) {
                if (v.custom.name === name && this.polygonLayer) {
                    this.polygonLayer.removeMarker(v);
                    this.makers.splice(i, 1);
                }
            } else if (v instanceof fengmap.FMTextMarker) {
                if (v.name === name && this.textLayer) {
                    this.textLayer.removeMarker(v);
                    this.makers.splice(i, 1);
                }
            }
        }
    }

    protected createPolygonMaker(coords: Vector2[], name: string) {
        const coordslist = coords.map(v => coodXy(v, this.locOrigion, this.locRange, this.margin!));

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

    protected addTextMarker(coord: Vector2, name: string) {
        const newlist = coodXy(coord, this.locOrigion, this.locRange, this.margin!);
        const group = this.map.getFMGroup(this.map.groupIDs[0]);

        // 返回当前层中第一个textMarkerLayer,如果没有，则自动创建
        this.textLayer = group.getOrCreateLayer('textMarker');

        // 图标标注对象，默认位置为该楼层中心点
        const tm = new fengmap.FMTextMarker({
            name,
            x: newlist.x,
            y: newlist.y,
            fillcolor: '255,0,0',
            fontsize: 20,
            strokecolor: '255,255,0',
        });

        // 文本标注层添加文本Marker
        this.textLayer.addMarker(tm);
        this.makers.push(tm);
    }
}
