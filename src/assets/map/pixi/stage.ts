/**
 *
 */
import { DEVICE_PIXEL_RATIO } from '@/constant';
import { Transform } from '../transform/transform';

export default class Stage extends Transform {
    public map!: PIXI.Renderer;
    public stage = new PIXI.Container(); // 场景舞台

    private loaded: Set<() => void> = new Set(); // 加载完成后的执行函数
    private timer: number | null = null;

    private isLoaded: boolean = false;

    constructor(dom: HTMLElement) {
        super();

        this.map = PIXI.autoDetectRenderer({
            width: dom.offsetWidth,
            height: dom.offsetHeight,
            backgroundColor: 0xe2e2e2,
            resolution: DEVICE_PIXEL_RATIO,
            preserveDrawingBuffer: true
        });

        dom.innerHTML = '';
        dom.appendChild(this.map.view);

        this.loop();
    }

    public dispose() {
        this.timer && cancelAnimationFrame(this.timer);
        this.stage.destroy();
        this.map.destroy();

        this.loaded.clear();
    }

    /**
     * 初始化地图
     */
    protected async init(bg: string, margin: number[][]) {
        // ============================================确定并设置舞台尺寸
        const [p0, p1] = margin;
        const locRangeX = p1[0] - p0[0];
        const locRangeY = p1[1] - p0[1];

        const height = this.stage.height = this.map.height / 2;
        const width = this.stage.width = height * locRangeX / locRangeY;
        // ================================================================

        // ===========================================================设置舞台的变换
        this.stage.position.set(this.map.width / 4 / DEVICE_PIXEL_RATIO, height / 2 / DEVICE_PIXEL_RATIO);
        this.stage.pivot.set(width / 2, height / 2);
        this.stage.scale.set(1 / DEVICE_PIXEL_RATIO);
        // ==================================================================

        // ==================================================================初始化变换矩阵
        const scaleX = width / locRangeX;
        const scaleY = height / locRangeY;
        this.initTransform([
            [p0[0] * scaleX, height - p0[1] * scaleY],
            [p1[0] * scaleX, height - p1[1] * scaleY],
            ...margin
        ]);

        // ================================================================创建背景
        await this.createBg(bg, scaleX, scaleY, p0, p1);

        this.loaded.forEach(fn => fn());
        this.isLoaded = true;
    }

    /**
     * 绑定加载完成后的事件
     * 如果地图已加载完成，直接执行
     */
    protected bindLoaded(fn: () => void) {
        if (this.isLoaded) {
            fn();
        } else {
            this.loaded.add(fn);
        }
    }

    /**
     * 加载纹理
     */
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
        this.map.render(this.stage);
        PIXI.actionManager.update();
    }

    private async createBg(bg: string, scaleX: number, scaleY: number, p0: number[], p1: number[]) {
        const [texture] = await this.load(bg);

        const bgSprite = new PIXI.Sprite(texture);
        bgSprite.width = (p1[0] - p0[0]) * scaleX;
        bgSprite.height = (p1[1] - p0[1]) * scaleY;

        const { x, y } = this.location2map({ x: p0[0], y: p1[1] }, false);
        bgSprite.position.set(x, y);

        this.stage.addChild(bgSprite);
    }
}
