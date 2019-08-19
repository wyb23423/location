/**
 * pixi
 */
import * as PIXI from 'pixi.js';
import Stage from './stage';
import LineMgr from './line';
import { randomNum } from '@/assets/utils/util';
import 'pixi-action';

export class PIXIMgr extends Stage {
    public readonly has3D: boolean = false;
    public lineMgr!: LineMgr;

    private els: Map<string | number, any[]> = new Map(); // 已添加到舞台上的元素

    constructor(bg: string, dom: HTMLElement) {
        super(bg, dom);

        this.lineMgr = new LineMgr(this.stage);
    }
    /**
     * 显示区域
     */
    public zoneOpen(data: IZone) {
        const zones: Vector2[] = typeof data.position === 'string' ? JSON.parse(data.position) : data.position;
        this.createPolygonMarker(zones, data.name);
        this.addTextMarker(zones[0], data.name);
    }

    /**
     * 移除添加到舞台上的元素
     */
    public remove(name?: string | number) {
        this.find(name).forEach(v => this.stage.removeChild(v));
        if (name != null) {
            this.els.delete(name);
        } else {
            this.els.clear();
        }
    }

    public on(type: string, callback: any) {
        if (type === 'loadComplete') {
            this.loaded.push(callback);
        } else {
            const mapping: { [x: string]: string } = {
                mapClickNode: 'pointertap'
            };

            this.stage.on(mapping[type] || type, (e: PIXI.interaction.InteractionEvent) => {
                (<any>e).nodeType = fengmap.FMNodeType.ALL;

                const target = e.target;
                if (
                    target instanceof PIXI.Sprite
                    || (<any>target).custom && (<any>target).custom.nodeType === 'sprite'
                ) {
                    (<any>e).nodeType = fengmap.FMNodeType.IMAGE_MARKER;
                } else if (target instanceof PIXI.Text) {
                    (<any>e).nodeType = fengmap.FMNodeType.TEXT_MARKER;
                }
                (<any>e).eventInfo = { coord: this.stage.toLocal(e.data.global) };

                callback(e);
            });
        }
    }

    public addImage(
        opt: any,
        name?: string | number,
        gid?: number,
        isMapCoor: boolean = true
    ): Vector3 {
        let p = { x: opt.x, y: opt.y, z: 0 };

        if (!isMapCoor) {
            p = this.getCoordinate(p, true) || p;
        }

        this.load(opt.url).then(([texture]) => {
            const img = new PIXI.Sprite(texture);

            if (opt.size != null) {
                img.width = img.height = opt.size;
            }

            img.anchor.set(0.5);
            img.position.set(p.x, p.y);

            img.interactive = true;
            img.buttonMode = true;
            img.zIndex = Math.ceil(opt.height || 0);

            this.save(img, (name || JSON.stringify(p)) + '');

            if (opt.callback) {
                opt.callback(img);
            }
        });

        return p;
    }

    /**
     * 创建多边形
     * @param coords 坐标信息
     * @param name 标识符
     * @param isMapCoor 是否已是显示坐标
     */
    public createPolygonMarker(
        coords: Vector2[],
        name: string,
        isMapCoor: boolean = false,
        gid?: number
    ) {
        const points = coords.map(v => {
            if (!isMapCoor) {
                v = this.getCoordinate(v, true) || v;
            }

            return [v.x, v.y];
        }).flat();

        const triangle = new PIXI.Graphics();
        triangle.beginFill(randomNum(0, 0xffffff), 0.5); // 填充色
        triangle.lineStyle(2, randomNum(0, 0xffffff), 1); // 边框

        triangle.drawPolygon(points);
        triangle.interactive = true;
        triangle.buttonMode = true;

        this.save(triangle, name);
    }

    /**
     * 添加文本
     */
    public addTextMarker(
        coord: Vector2 | any,
        name: string,
        isMapCoor: boolean = false,
        gid?: number
    ): Promise<any> {
        let newlist = {
            x: coord.x,
            y: coord.y
        };

        // tslint:disable-next-line:no-conditional-assignment
        if (!isMapCoor) {
            newlist = this.getCoordinate(newlist, true);
        }

        return new Promise(resolve => {
            const message = new PIXI.Text(name, {
                fill: coord.fillcolor || '#ff0000',
                fontSize: coord.fontsize || 20,
                stroke: coord.strokecolor || '#ffff00',
                ...coord
            });
            message.position.set((<Vector23>newlist).x, (<Vector23>newlist).y);
            message.anchor.set(0.5, 0.5);

            this.save(message, name);

            resolve(message);
        });
    }

    // 移动
    public moveTo(
        name: string | number,
        coord: Vector23,
        time: number = 1, // 动画时间
        update?: (v: Vector2) => void, // 移动时回调
        callback?: () => void, // 移动完成时回调
        isMapCoor: boolean = false,
    ) {
        if (!isMapCoor) {
            coord = this.getCoordinate(coord, true);
        }

        const action = new PIXI.action.MoveTo(coord.x, coord.y, time);
        this.find(name).forEach(v => {
            if (v.animation && v.animation.moveTo) {
                PIXI.actionManager.cancelAction(v.animation.moveTo);
                v.animation = null;
            }

            const animation = PIXI.actionManager.runAction(v, action);
            animation.on('update', (s: PIXI.Container) => {
                if (update) {
                    update(s.position);
                }
            });
            animation.on('end', () => {
                if (v.animation) {
                    v.animation.moveTo = null;
                }

                callback && callback();
            });

            v.animation = v.animation || {};
            v.animation.moveTo = animation;
        });
    }

    public stopMoveTo(name?: string | number) {
        this.find(name).forEach(v => {
            if (v.animation && v.animation.moveTo) {
                PIXI.actionManager.cancelAction(v.animation.moveTo);
                v.animation = null;
            }
        });
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
        this.find(name).forEach(v => v.visible = isShow == null ? !v.visible : isShow);
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
        const triangle = new PIXI.Graphics();
        triangle.beginFill(0xffffff, 1); // 填充色
        triangle.lineStyle(2, 0xcccccc, 1); // 边框
        triangle.drawPolygon([
            0, 0,
            10, -10,
            120, -10,
            120, -120,
            -120, -120,
            -120, -10,
            -10, -10
        ]);

        triangle.position.y = -45;
        triangle.alpha = 0.7;
        img.addChild(triangle);

        let text: PIXI.Text;
        if ((<any>img).custom && (<any>img).custom.info) {
            const info = (<any>img).custom.info;
            text = new PIXI.Text(`名字: ${info.tagName}\n\n编号: ${info.tagNo}`, { fontSize: 24 });
            text.anchor.y = 0.5;
            text.position.set(-75, -105);
            text.alpha = 0.8;
            img.addChild(text);
        }

        return {
            close: () => {
                img.removeChild(triangle);
                if (text) {
                    img.removeChild(text);
                }
            }
        };
    }

    // 查找标记为name的元素
    public find(name?: string | number) {
        if (name == null) {
            return Array.from(this.els.values()).flat();
        }

        return this.els.get(name) || [];
    }

    public dispose() {
        this.lineMgr.dispose();
        super.dispose();
        this.els.clear();
    }

    private save(el: any, name: string | number) {
        this.stage.addChild(el);

        const els = this.els.get(name) || [];
        els.push(el);
        this.els.set(name, els);
    }
}
