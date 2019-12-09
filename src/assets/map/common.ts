

/**
 * 获取元素的自定义属性
 */
export function getCustomInfo<K>(el: any, key: string): K | Record<string, undefined> {
    if (el == null) {
        return {};
    }

    el.custom = el.custom == null ? {} : el.custom;
    el.custom[key] = el.custom[key] == null ? {} : el.custom[key];

    return el.custom[key];
}

export const DEFAULT_HEATMAP_CONFIG = {
    gradient: {
        0.45: 'rgb(201,135,255)',
        0.55: 'rgb(189,97,255)',
        0.65: 'rgb(155,49,255)',
        0.95: 'yellow',
        1.0: 'rgb(157,53,255)'
    },
    opacity: 0.5,
    min: 0,
    max: 100,
    radius: 15
};

export function adaptationVector(v: Vector23 | VectorAxis): Vector3 {
    const vector: any = { ...v };
    vector.x = vector.x || vector.xaxis || 0;
    vector.y = vector.y || vector.yaxis || 0;
    vector.z = vector.z || vector.zaxis || null;

    return vector;
}


export class BaseHeatMap {
    protected data: PointData[] = [];

    constructor(protected config: HeatMapConfig = {}) {
        this.config = {
            ...DEFAULT_HEATMAP_CONFIG,
            ...config
        };
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

    protected create(w: number, h: number, parseCoord?: (p: PointData) => Vector2) {
        const canvas: HTMLCanvasElement = this.createCanvas();
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

        const r = this.config.radius || (this.config.radius = Math.min(w, h) / 10);
        w = canvas.width = w + r * 2;
        h = canvas.height = h + r * 2;

        this.renderAlpha(ctx, parseCoord);
        this.putColor(ctx, w, h);

        return canvas;
    }

    // 绘制alpha通道的圆
    private renderAlpha(ctx: CanvasRenderingContext2D, parseCoord?: (p: PointData) => Vector2) {
        const shadowCanvas = this.createShadowTpl();
        const { min, max, radius } = <Required<HeatMapConfig>>this.config;

        for (const point of this.data) {
            const { x, y } = parseCoord ? parseCoord(point) : point;
            const alpha = (point.value - min) / (max - min);
            ctx.globalAlpha = alpha;
            ctx.drawImage(shadowCanvas, x + radius, y + radius);
        }
    }

    // 为alpha通道的圆着色
    private putColor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const colorData = this.createColordata();
        const imgData = ctx.getImageData(0, 0, width, height);
        const { data } = imgData;

        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            if (value) {
                data[i - 3] = colorData[4 * value];
                data[i - 2] = colorData[4 * value + 1];
                data[i - 1] = colorData[4 * value + 2];
            }
        }
        ctx.putImageData(imgData, 0, 0);
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
