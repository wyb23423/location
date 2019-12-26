/**
 * pixi
 */
import * as PIXI from 'pixi.js';
import LineMgr from './marker/line';
import { getCustomInfo } from '../common';
import { PopInfo } from './marker/pop';
import { ElsMgr } from './element';
import { ZONE_SEPARATOR } from '@/constant';

export class PIXIMgr extends ElsMgr {
    public readonly has3D: boolean = false;
    public lineMgr!: LineMgr;

    constructor(bg: string, dom: HTMLElement) {
        super(bg, dom);

        this.lineMgr = new LineMgr(this.stage);
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

    public on(type: string, callback: any) {
        if (type === 'loadComplete') {
            this.loaded.push(callback);
        } else {
            const mapping: { [x: string]: string } = {
                mapClickNode: 'pointertap'
            };

            this.stage.on(mapping[type] || type, (e: PIXI.interaction.InteractionEvent) => {
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
        console.log('此实现方式没有3D模式');
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
        if (!isMapCoor) {
            points = points.map(v => this.getCoordinate(v, true));
        }

        this.lineMgr.add(points, name, lineStyle);
    }
    // 为一条线添加片段
    public appendLine(name: string | number, points: Vector3[], isMapCoor: boolean = false) {
        if (!isMapCoor) {
            points = points.map(v => this.getCoordinate(v, true));
        }

        this.lineMgr.append(points, name);
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
        super.dispose();
    }
}
