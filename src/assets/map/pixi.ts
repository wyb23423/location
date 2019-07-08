/**
 * pixi
 */
import * as PIXI from 'pixi.js';
import { MapEvent } from './event';
import { randomNum } from '../utils/util';
import 'pixi-action';

export class PIXIMgr extends MapEvent {
    public readonly has3D: boolean = false;

    public map!: PIXI.Renderer;

    public margin?: TPosition[];
    public locOrigion: Vector2 = { x: 0, y: 0 };

    // tslint:disable-next-line:variable-name
    private _locRange?: Vector2;
    private bg: string = '';
    private timer: number | null = null;
    private els: any[] = []; // 已添加到舞台上的元素

    public set locRange(data: Vector2) {
        if (!this._locRange) {
            this._locRange = data;
            this.initStageAndAddBg(data);
        } else {
            console.error('地图范围只能设置一次');
        }
    }

    constructor(bg: string, dom: HTMLElement) {
        super(dom);

        this.map = PIXI.autoDetectRenderer({
            width: dom.offsetWidth,
            height: dom.offsetHeight,
            backgroundColor: 0xe2e2e2
        });

        dom.innerHTML = '';
        dom.appendChild(this.map.view);

        this.bg = bg;
        this.loop();

        this.stage.interactive = true;
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
        for (let i = this.els.length - 1; i >= 0; i--) {
            const el = this.els[i];
            if (name == null || el.name === name) {
                this.stage.removeChild(el);
                this.els.splice(i, 1);
            }
        }
    }

    public on(type: string, callback: any) {
        if (type === 'loadComplete') {
            callback();
        } else {
            const mapping: { [x: string]: string } = {
                mapClickNode: 'pointertap'
            };

            this.stage.on(mapping[type] || type, (e: any) => {
                e.nodeType = fengmap.FMNodeType.ALL;

                const target = e.target;
                if (target instanceof PIXI.Sprite) {
                    e.nodeType = fengmap.FMNodeType.IMAGE_MARKER;
                } else if (target instanceof PIXI.Text) {
                    e.nodeType = fengmap.FMNodeType.TEXT_MARKER;
                }
                e.eventInfo = { coord: this.stage.toLocal(e.data.global) };

                callback(e);
            });
        }
    }

    public addImage(
        opt: any,
        name?: string | number,
        gid?: number,
        isMapCoor: boolean = true
    ) {
        let p = { x: opt.x, y: opt.y, z: 0 };

        if (!isMapCoor) {
            p = this.getCoordinate(p, true);
        }

        this.load(opt.url).then(([texture]) => {
            const img = new PIXI.Sprite(texture);
            img.position.set(p.x, p.y);
            img.anchor.set(0.5, 0.5);

            if (opt.size != null) {
                img.width = img.height = opt.size;
            }

            img.name = (name || JSON.stringify(p)) + '';
            img.interactive = true;
            img.buttonMode = true;

            this.els.push(img);
            this.stage.addChild(img);

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
    public createPolygonMarker(coords: Vector2[], name: string, isMapCoor: boolean = false) {
        const points = coords.map(v => {
            if (!isMapCoor) {
                v = this.getCoordinate(v, true);
            }

            return [v.x, v.y];
        }).flat();

        const triangle = new PIXI.Graphics();
        triangle.beginFill(randomNum(0, 0xffffff), 0.5); // 填充色
        triangle.lineStyle(2, randomNum(0, 0xffffff), 1); // 边框

        triangle.drawPolygon(points);
        triangle.interactive = true;
        triangle.buttonMode = true;

        triangle.name = name;
        this.els.push(triangle);
        this.stage.addChild(triangle);
    }

    /**
     * 添加文本
     */
    public addTextMarker(
        coord: Vector2 | any,
        name: string,
        isMapCoor: boolean = false
    ): Promise<any> {
        if (!this._locRange) {
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
            newlist = this.getCoordinate(newlist, true);
        }

        return new Promise(resolve => {
            const message = new PIXI.Text(name, {
                fill: coord.fillcolor || '#ff0000',
                fontSize: coord.fontsize || 20,
                stroke: coord.strokecolor || '#ffff00',
                ...coord
            });
            message.position.set(newlist.x, newlist.y);
            message.anchor.set(0.5, 0.5);

            message.name = name;
            this.els.push(message);
            this.stage.addChild(message);

            resolve(message);
        });
    }

    public dispose() {
        if (this.timer) {
            cancelAnimationFrame(this.timer);
            this.timer = null;
        }

        if (this.stage) {
            this.stage.destroy();
        }
        if (this.map) {
            this.map.destroy();
        }

        Reflect.set(this, 'map', null);
        Reflect.set(this, 'stage', null);

        this._locRange = undefined;
    }

    // 移动
    public moveTo(
        name: string | number,
        coord: Vector23,
        time: number = 1, // 动画时间
        update?: (v: Vector2) => void, // 移动时回调
        // tslint:disable-next-line: ban-types
        callback?: Function, // 移动完成时回调
        isMapCoor: boolean = false,
    ) {
        if (!isMapCoor) {
            coord = this.getCoordinate(coord, true);
        }

        const action = new PIXI.action.MoveTo(coord.x, coord.y, time);
        this.els.forEach(v => {
            if (v.name === name) {
                const animation = PIXI.actionManager.runAction(v, action);
                animation.on('update', (s: PIXI.Sprite) => {
                    if (update) {
                        update(s.getGlobalPosition());
                    }
                });
                if (callback) {
                    animation.on('end', callback);
                }

                v.animation = v.animation || {};

                v.animation.moveTo = animation;
            }
        });
    }

    public stopMoveTo(name?: string | number) {
        this.els.forEach(v => {
            if ((name == null || name === v.name) && v.animation.moveTo) {
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
        this.els.forEach(v => {
            if (name == null || v.name === name) {
                v.visible = isShow == null ? !v.visible : isShow;
            }
        });
    }

    /**
     * 地图坐标与定位坐标转化
     * @param is2map 是否是定位坐标转为地图坐标
     */
    public getCoordinate(v: Vector23, is2map: boolean = false) {
        v = { ...v };

        if (!this._locRange) {
            console.error('地图范围为空');
        } else {
            const height = (<any>this.stage)._height;

            const scaleX = (<any>this.stage)._width / this._locRange.x;
            const scaleY = height / this._locRange.y;

            if (is2map) {
                v.x *= scaleX;
                v.y = height - v.y * scaleY;
            } else {
                v.x /= scaleX;
                v.y = (height - v.y) / scaleY;
            }
        }

        v.z = v.z == null ? 0 : v.z;
        return <Vector3>v;
    }

    private loop() {
        this.timer = requestAnimationFrame(this.loop.bind(this));

        if (this.map && this.stage) {
            this.map.render(this.stage);
            PIXI.actionManager.update();
        }
    }

    private initStageAndAddBg(locRange: Vector2) {
        const height = this.stage.height = this.map.height / 2;
        const width = this.stage.width = height * locRange.x / locRange.y;

        this.stage.position.set(this.map.width / 2, height);
        this.stage.pivot.set(width / 2, height / 2);

        this.load(this.bg).then((([texture]) => {
            const bgSprite = new PIXI.Sprite(texture);
            bgSprite.width = width;
            bgSprite.height = height;
            this.stage.addChild(bgSprite);
        }));
    }

    // 加载纹理
    private load(...src: string[] | [string[]]): Promise<PIXI.Texture[]> {
        if (Array.isArray(src[0])) {
            src = src[0];
        }

        const textures: PIXI.Texture[] = [];
        const emptys: number[] = [];
        for (let i = src.length - 1; i >= 0; i--) {
            const texture = PIXI.utils.TextureCache[<string>src[i]];
            if (texture) {
                textures[i] = texture;
                src.splice(i, 1);
            } else {
                emptys.push(i);
            }
        }

        return new Promise(resolve => {
            if (!src.length) {
                resolve(textures);
            } else {
                const loader = new PIXI.Loader();
                loader
                    .add(src)
                    .load(() => {
                        emptys.forEach(i => textures[i] = loader.resources[<string>src.shift()].texture);
                        resolve(textures);
                    });
            }
        });
    }
}
