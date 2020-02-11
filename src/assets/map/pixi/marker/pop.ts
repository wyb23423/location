import * as PIXI from 'pixi.js';
import { getCustomInfo } from '../../common';

export class PopInfo {
    public static readonly INFO_POSITION_Y = {
        name: -155,
        no: -120,
        heart: -85,
    };

    private heartEl?: PIXI.Container;
    private triangle!: PIXI.Graphics;
    private time!: number;

    constructor(img: PIXI.Sprite) {
        this.init(img);
        this.time = Date.now();
    }

    public updateInfo(info: ITagInfo) {
        if (!(this.heartEl)) {
            return false;
        }

        this.updateHeartRate(info.iHeartRate);

        return true;
    }

    public close(img: PIXI.Sprite) {
        img.removeChildren();
        (<any>this.triangle) = this.heartEl = undefined;
    }

    // 更新心率的显示
    private updateHeartRate(heartRate: number) {
        (this.heartEl!.children[0] as PIXI.Text).text = `${heartRate}`;

        const now = Date.now();
        if (now - this.time >= 500) {
            this.heartEl!.alpha = this.heartEl!.alpha ? 0 : 1;
            this.time = now;
        }
    }

    private async init(img: PIXI.Sprite) {
        img.addChild(this.createBp());

        const { tagName, name } = getCustomInfo<{ tagName: string; name: string }>(img, 'info');
        img.addChild(await this.createInfoItem('name', tagName || '未知标签'));
        img.addChild(await this.createInfoItem('no', name || '未编号'));
        img.addChild(await this.createInfoItem('heart', '--'));
    }

    private createBp() {
        const triangle = this.triangle = new PIXI.Graphics();
        triangle.beginFill(0xffffff, 1); // 填充色
        triangle.lineStyle(2, 0xcccccc, 1); // 边框
        triangle.drawPolygon([
            0, 0,
            10, -10,
            90, -10,
            90, -115,
            -90, -115,
            -90, -10,
            -10, -10
        ]);

        triangle.position.y = -45;
        triangle.alpha = 0.7;

        return triangle;
    }

    private async createInfoItem(icon: keyof typeof PopInfo.INFO_POSITION_Y, text: string | number) {
        const container = new PIXI.Container();
        container.position.set(-75, PopInfo.INFO_POSITION_Y[icon]);
        container.alpha = 0.8;

        container.addChild(this.createText(text));
        container.addChild(await this.createIcon(icon));

        if (icon === 'heart') {
            this.heartEl = container;
        }

        return container;
    }

    private async createIcon(icon: keyof typeof PopInfo.INFO_POSITION_Y) {
        const src = `/images/${icon}.png`;
        const texture = await new Promise<PIXI.Texture>(resolve => {
            const cache = PIXI.utils.TextureCache[src];
            if (cache) {
                resolve(cache);
            } else {
                const loader = new PIXI.Loader();
                loader.add(src).load(() => resolve(loader.resources[src].texture));
            }
        });

        const iconEl = new PIXI.Sprite(texture);
        iconEl.width = iconEl.height = 25;

        return iconEl;
    }

    private createText(text: string | number) {
        const textEl = new PIXI.Text('' + text);
        textEl.anchor.y = 0.5;
        textEl.position.set(35, 12);

        return textEl;
    }
}
