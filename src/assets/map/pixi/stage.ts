/**
 *
 */

import { MapEvent } from './event';

class Transform extends MapEvent {
    public margin?: TPosition[];
    public locOrigion: Vector2 = { x: 0, y: 0 };

    // tslint:disable-next-line:variable-name
    private _locRange?: Vector2;
    public set locRange(data: Vector2) {
        if (!this._locRange) {
            this._locRange = data;
            this.initStageAndAddBg(data);
        } else {
            console.error('地图范围只能设置一次');
        }
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

    protected initStageAndAddBg(vec: Vector2) {
        throw new ReferenceError('Method Transform.prototype.initStageAndAddBg is not defined');
    }
}

export default class Stage extends Transform {
    public map!: PIXI.Renderer;

    protected loaded: Array<() => void> = []; // 加载完成后的执行函数
    protected timer: number | null = null;

    constructor(private bg: string, dom: HTMLElement) {
        super(dom);

        this.map = PIXI.autoDetectRenderer({
            width: dom.offsetWidth,
            height: dom.offsetHeight,
            backgroundColor: 0xe2e2e2
        });

        dom.innerHTML = '';
        dom.appendChild(this.map.view);

        this.loop();
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

        this.stage.position.set(this.map.width / 2, height);
        this.stage.pivot.set(width / 2, height / 2);

        this.load(this.bg).then((([texture]) => {
            const bgSprite = new PIXI.Sprite(texture);
            bgSprite.width = width;
            bgSprite.height = height;
            this.stage.addChild(bgSprite);

            this.loaded.forEach(fn => fn());
        }));
    }

    // 加载纹理
    protected load(...src: string[] | [string[]]): Promise<PIXI.Texture[]> {
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

    private loop() {
        this.timer = requestAnimationFrame(this.loop.bind(this));

        if (this.map && this.stage) {
            this.map.render(this.stage);
            PIXI.actionManager.update();
        }
    }
}
