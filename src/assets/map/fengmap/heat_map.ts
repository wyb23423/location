import { BaseHeatMap } from '../common';
import { PIXIMgr } from '../pixi';
import { FengMapMgr } from '.';

export default class HeatMap extends BaseHeatMap {
    private sprite = new Image();
    private timer?: number;

    constructor(config: HeatMapConfig & { map: fengmap.FMMap }) {
        super(config);

        const box = document.getElementById('map-box');
        if (!box) {
            console.warn('地图错误');
        } else {
            const { left, top } = box.getBoundingClientRect();
            Object.assign(this.sprite.style, {
                position: 'absolute',
                display: 'none',
                transformOrigin: 'left top',
                left: left + 'px',
                top: top + 'px',
                zIndex: 2,
                pointerEvents: 'none'
            });
        }
    }

    /**
     * 生成热力图
     * @param mgr 类型只能是FengMapMgr, PIXIMgr是为了兼容另一种实现
     */
    public async render(mgr: PIXIMgr | FengMapMgr) {
        if (!(mgr instanceof FengMapMgr && this.data.length)) {
            return;
        }

        const { min, max } = this.resolve();
        const originWidth = max[0] - min[0];
        const originHeight = max[1] - min[1];

        let scale = document.body.offsetWidth * 0.8 / Math.max(originWidth, originHeight);
        scale = scale === Infinity ? 0 : scale;
        this.config.radius = 0; // 触发半径的比例计算

        const canvas = this.create(
            originWidth * scale,
            originHeight * scale,
            p => ({ x: (p.x - min[0]) * scale, y: (p.y - min[1]) * scale })
        );
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(<Blob>b), 'image/png', 1));

        const img = this.sprite;
        img.width = canvas.width;
        img.height = canvas.height;
        img.src && window.URL.revokeObjectURL(img.src);
        img.src = window.URL.createObjectURL(blob);
        img.style.display = 'block';

        this.timer || document.body.appendChild(img);
        this.listener(mgr.map, min, max);
    }

    /**
     * 移除热力图
     */
    public remove(mgr: PIXIMgr | FengMapMgr) {
        this.timer && cancelAnimationFrame(this.timer);
        this.timer = void 0;
        try {
            window.URL.revokeObjectURL(this.sprite.src);
            document.body.removeChild(this.sprite);
        } catch (e) {
            //
        }
    }

    public paint(ctx: CanvasRenderingContext2D) {
        const arr = this.sprite.style.transform.match(/(\d|\.)+/g);
        if (arr) {
            const [x, y, sx, sy] = arr;
            ctx.translate(+x, +y);
            ctx.scale(+sx, -sy);
            ctx.drawImage(this.sprite, 0, 0);
        } else {
            console.warn('解析transform失败');
        }
    }

    private resolve() {
        const min = [Number.MAX_VALUE, Number.MAX_VALUE];
        const max = [-Number.MAX_VALUE, -Number.MAX_VALUE];

        this.data.forEach(v => {
            min[0] = Math.min(min[0], v.x);
            min[1] = Math.min(min[1], v.y);
            max[0] = Math.max(max[0], v.x);
            max[1] = Math.max(max[1], v.y);
        });

        return { min, max };
    }

    private listener(map: fengmap.FMMap, min: number[], max: number[]) {
        this.timer && cancelAnimationFrame(this.timer);

        const minCoord = map.coordMapToScreen(min[0], min[1], 1);
        const maxCoord = map.coordMapToScreen(max[0], max[1], 1);

        const w = Math.abs(maxCoord.x - minCoord.x);
        const h = Math.abs(maxCoord.y - minCoord.y);

        const { width, height, style } = this.sprite;
        const mapScale = map.mapScaleLevel / map.mapScale;
        const sx = w / width || mapScale;
        const sy = h / height || mapScale;
        const r = this.config.radius;
        const tx = minCoord.x - r * sx;
        const ty = minCoord.y - r * sy;
        style.transform = `translate(${tx}px,${ty}px) scale(${sx},${h ? '-' : '+'}${sy})`;

        this.timer = requestAnimationFrame(this.listener.bind(this, map, min, max));
    }
}
