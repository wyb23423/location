/**
 * pixi
 */
import * as PIXI from 'pixi.js';
import LineMgr from './marker/line';
import { getCustomInfo } from '../common';
import { PopInfo } from './marker/pop';
import { Element } from './element';
import { ZONE_SEPARATOR } from '@/constant';
import { MapEvent } from './event';

export class PIXIMgr extends Element {
    public readonly has3D: boolean = false;
    public lineMgr: LineMgr = new LineMgr(this.stage);

    private event = new MapEvent();

    constructor(bg: string, dom: HTMLElement, margin: number[][]) {
        super(dom);

        this.bindLoaded(() => this.event.apply(dom, this.stage));
        this.init(bg, margin);
    }
    /**
     * 显示区域
     */
    public zoneOpen(data: IZone) {
        let zones = typeof data.position === 'string' ? JSON.parse(data.position) : data.position;
        zones = zones.coordinates || zones;

        const name = data.id + ZONE_SEPARATOR + data.name;
        this.createPolygonMarker(zones, name);
        this.addTextMarker(zones[0], name);
    }

    public on(type: string, callback: (...args: any[]) => any) {
        if (type === 'loadComplete') {
            this.bindLoaded(callback);
        } else {
            const mapping: { [x: string]: string } = {
                mapClickNode: 'pointertap'
            };

            this.stage.on(mapping[type] || type, (e: PIXI.InteractionEvent) => {
                let nodeType = fengmap.FMNodeType.ALL;
                const target = e.target;
                if (
                    target instanceof PIXI.Sprite
                    || getCustomInfo<string>(target, 'nodeType') === 'sprite'
                ) {
                    nodeType = fengmap.FMNodeType.IMAGE_MARKER;
                } else if (target instanceof PIXI.Text) {
                    nodeType = fengmap.FMNodeType.TEXT_MARKER;
                }

                callback(Object.assign(e, {
                    nodeType,
                    eventInfo: { coord: this.stage.toLocal(e.data.global) }
                }));
            });
        }
    }

    public switchViewMode() {
        // 没有3D模式
        console.info('此实现方式没有3D模式');
    }

    /**
     * 切换元素的显示状态
     * @param name 标识符。默认全部
     * @param isShow 是否显示。默认切换状态
     */
    public show(name?: string | number, isShow?: boolean) {
        this.find(name).forEach(v => {
            v.visible = isShow == null ? !v.visible : isShow;
            this.animation.stop(v, 'twinkle');
        });
    }

    // 添加线
    public addLine(
        points: Vector3[],
        lineStyle: LineStyle,
        name: string | number,
        isMapCoor: boolean = false
    ) {
        points = isMapCoor ? points : points.map(v => this.location2map(v, true));
        this.lineMgr.add(points, name, lineStyle);
    }
    // 为一条线添加片段
    public appendLine(
        name: string | number,
        points: Vector3[],
        isMapCoor: boolean = false,
        count = 3000
    ) {
        points = isMapCoor ? points : points.map(v => this.location2map(v, true));
        this.lineMgr.append(points, name, count);
    }

    // 为标签添加信息添加弹窗
    public addPopInfo(img: PIXI.Sprite) {
        const pop = new PopInfo(img);
        const zIndex = img.zIndex;

        img.zIndex = Math.max(99, img.zIndex);
        this.stage.sortChildren();

        return {
            updateInfo: pop.updateInfo.bind(pop),
            close: () => {
                pop.close(img);
                img.zIndex = zIndex;
                this.stage && this.stage.sortChildren();

                return true;
            }
        };
    }

    public dispose() {
        this.lineMgr.dispose();
        this.event.dispose();
        super.dispose();
    }
}
