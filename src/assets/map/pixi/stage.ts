/**
 *
 */

import { MapEvent } from './event';

export default class Stage extends MapEvent {
    public map!: PIXI.Renderer;

    public locOrigion: Vector2 = { x: 0, y: 0 };

    protected loaded: Array<() => void> = []; // 加载完成后的执行函数
    protected timer: number | null = null;

    // tslint:disable-next-line:variable-name
    private _locRange?: Vector2;
    // tslint:disable-next-line:variable-name
    private _margin?: TPosition;

    constructor(private bg: string, dom: HTMLElement) {
        super(dom);

        this.map = PIXI.autoDetectRenderer({
            width: dom.offsetWidth,
            height: dom.offsetHeight,
            backgroundColor: 0xe2e2e2,
            resolution: 2,
            preserveDrawingBuffer: true
        });

        dom.innerHTML = '';
        dom.appendChild(this.map.view);

        this.loop();
    }

    public set margin(data: TPosition) {
        if (!this._margin) {
            this._margin = data;
            this._locRange && this.initStageAndAddBg(this._locRange);
        } else {
            console.error('地图边界只能设置一次');
        }
    }

    public set locRange(data: Vector2) {
        if (!this._locRange) {
            this._locRange = data;
            this._margin && this.initStageAndAddBg(data);
        } else {
            console.error('地图范围只能设置一次');
        }
    }

    /**
     * 地图坐标与定位坐标转化
     * @param is2map 是否是定位坐标转为地图坐标
     */
    public getCoordinate(v: Vector23, is2map: boolean = false) {
        const vector: any = { ...v };
        vector.x = vector.x || vector.xaxis || 0;
        vector.y = vector.y || vector.yaxis || 0;
        vector.z = vector.z || vector.zaxis || 0;

        if (!this._locRange) {
            console.error('地图范围为空');
        } else {
            const height = (<any>this.stage)._height;

            const scaleX = (<any>this.stage)._width / this._locRange.x;
            const scaleY = height / this._locRange.y;

            if (is2map) {
                vector.x *= scaleX;
                vector.y = height - vector.y * scaleY;
            } else {
                vector.x /= scaleX;
                vector.y = (height - vector.y) / scaleY;
            }
        }

        return <Vector3>vector;
    }

    public parseCood(data: Vector23 | Vector23[]) {
        if (Array.isArray(data)) {
            return data.map(v => this.getCoordinate(v, true));
        }

        return this.getCoordinate(data, true);
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

        this.loaded.length = 0;
    }

    // 初始化舞台及背景图
    protected initStageAndAddBg(locRange: Vector2) {
        const height = this.stage.height = this.map.height / 2;
        const width = this.stage.width = height * locRange.x / locRange.y;

        this.stage.position.set(this.map.width / 8, height / 4);
        this.stage.pivot.set(width / 2, height / 2);
        this.stage.scale.set(0.4);

        this.createBg(width / locRange.x, height / locRange.y);
    }

    // 加载纹理
    protected load(...src: string[] | [string[]]): Promise<PIXI.Texture[]> {
        if (Array.isArray(src[0])) {
            src = src[0];
        }

        const textures: PIXI.Texture[] = [];
        const emptys: number[] = [];
        for (let i = src.length - 1; i >= 0; i--) {
            const url = <string>src[i];
            const texture = PIXI.utils.TextureCache[url];
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

    private loop() {
        this.timer = requestAnimationFrame(this.loop.bind(this));

        if (this.map && this.stage) {
            this.map.render(this.stage);
            PIXI.actionManager.update();
        }
    }

    private async createBg(scaleX: number, scaleY: number) {
        const [texture] = await this.load(this.bg);

        const [p0, p1, p2] = this._margin!;

        const bgSprite = new PIXI.Sprite(texture);
        bgSprite.width = (p2.x - p0.x) * scaleX;
        bgSprite.height = (p2.y - p0.y) * scaleY;
        const { x, y } = this.getCoordinate(p1, true);
        bgSprite.position.set(x, y);

        this.stage.addChild(bgSprite);

        this.loaded.forEach(fn => fn());
    }
}
