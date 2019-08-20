/**
 * 热力图
 */

interface HeatMapConfig {
    gradient?: object;
    radius?: number;
    min?: number;
    max?: number;
    opacity?: number;
    stage: PIXI.Container;
}

export class HeatMap {
    public static defaultConfig = {
        gradient: {
            0.45: 'rgb(201,135,255)',
            0.55: 'rgb(189,97,255)',
            0.65: 'rgb(155,49,255)',
            0.95: 'yellow',
            1.0: 'rgb(157,53,255)'
        },
        opacity: 1,
        min: 0,
        max: 100,
        radius: 20
    };

    private data: PointData[] = [];
    private canvas: HTMLCanvasElement = this.createCanvas();
    private ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');

    constructor(private config: HeatMapConfig) {
        this.config = {
            ...HeatMap.defaultConfig,
            ...config
        };

        this.canvas.width = this.config.stage.width;
        this.canvas.height = this.config.stage.height;
    }

    public addPoints(data: PointData[]) {
        this.data.push(...data);
    }
    public addPoint(x: number, y: number, value: number) {
        this.data.push({ x, y, value });
    }
    public clearPoints() {
        this.data.length = 0;
    }
    public render() {
        this.renderAlpha();
        this.putColor();
    }

    // 绘制alpha通道的圆
    private renderAlpha() {
        const shadowCanvas = this.createShadowTpl();
        const { min, max } = this.config;
        for (const point of this.data) {
            const alpha = (point.value - min!) / (max! - min!);
            this.ctx.globalAlpha = alpha;
            this.ctx.drawImage(shadowCanvas, point.x, point.y);
        }
    }

    // 为alpha通道的圆着色
    private putColor() {
        const colorData = this.createColordata();
        const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const { data } = imgData;

        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            if (value) {
                data[i - 3] = colorData[4 * value];
                data[i - 2] = colorData[4 * value + 1];
                data[i - 1] = colorData[4 * value + 2];
            }
        }
        this.ctx.putImageData(imgData, 0, 0);
    }

    private createCanvas() {
        return document.createElement('canvas');
    }

    private createColordata() {
        const cCanvas = this.createCanvas();
        const cCtx = <CanvasRenderingContext2D>cCanvas.getContext('2d');
        cCanvas.width = 256;
        cCanvas.height = 1;
        const tuple: [number, number, number, number] =
            [0, 0, cCanvas.width, cCanvas.height];

        const grd = cCtx.createLinearGradient(...tuple);
        for (const [key, value] of Object.entries(this.config.gradient!)) {
            grd.addColorStop(parseFloat(key), value);
        }
        cCtx.fillStyle = grd;
        cCtx.fillRect(0, 0, cCanvas.width, cCanvas.height);

        return cCtx.getImageData(...tuple).data;
    }

    /**
     * 离屏canvas绘制一个黑色（rgb都是0，方便处理）的alpha通道的圆
     */
    private createShadowTpl() {
        const tCanvas = this.createCanvas();
        const tCtx = <CanvasRenderingContext2D>tCanvas.getContext('2d');

        const radius = <number>this.config.radius;
        tCanvas.width = 2 * radius;
        tCanvas.height = 2 * radius;

        const grd = tCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
        grd.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        tCtx.fillStyle = grd;
        tCtx.fillRect(0, 0, 2 * radius, 2 * radius);

        return tCanvas;
    }
}
