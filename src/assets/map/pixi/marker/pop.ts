import * as PIXI from 'pixi.js';

export class PopInfo {
    public info?: { tagName: string; name: string };
    private textEl?: PIXI.Text;
    private triangle!: PIXI.Graphics;
    private time!: number;

    constructor(img: PIXI.Sprite) {
        img.addChild(this.createBp());
        this.info = this.addText(img);
        this.time = Date.now();
    }

    public update(iHeartRate: number) {
        if (!(this.textEl && this.info)) {
            return false;
        }

        const el = this.textEl.children[0] as PIXI.Text;
        el.text = `${iHeartRate}`;

        const now = Date.now();
        if (now - this.time >= 500) {
            el.alpha = el.alpha ? 0 : 1;
            this.time = now;
        }

        return true;
    }

    public close(img: PIXI.Sprite) {
        img.removeChild(this.triangle);
        this.textEl && img.removeChild(this.textEl);

        (<any>this.triangle) = this.textEl = undefined;
    }

    private createBp() {
        const triangle = this.triangle = new PIXI.Graphics();
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

        return triangle;
    }

    private addText(img: PIXI.Sprite) {
        const custom = (<any>img).custom;
        let info: { tagName: string; name: string };
        if (custom && custom.info) {
            info = custom.info;
            const text = this.textEl = new PIXI.Text(
                `名字: ${info.tagName}\n编号: ${info.name}\n心率:`,
                { fontSize: 24 }
            );
            text.anchor.y = 0.5;
            text.position.set(-75, -105);
            text.alpha = 0.8;
            text.addChild(this.createHeartRate());
            img.addChild(text);

            return info;
        }
    }

    private createHeartRate() {
        const rate = new PIXI.Text('--', { fontSize: 24 });
        rate.anchor.y = 0.5;
        rate.position.set(62, 28);

        return rate;
    }
}
