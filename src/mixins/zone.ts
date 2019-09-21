/**
 * 区域
 * 地图操作
 */
import Component, { mixins } from 'vue-class-component';
import MapMixin from './map';
import { FengMapMgr } from '@/assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';
import segmentsIntersect from '@/assets/utils/intersect';

@Component
export default class ZoneMixin extends mixins(MapMixin) {
    private static readonly LINE_NAME = 'zone_line';
    private static readonly LINE_STYLE = {
        lineType: fengmap.FMLineType.FULL,
        lineWidth: 2,
        smooth: false,
        color: '#e00',
        colorNum: 0xee0000
    };

    public isDrawing: boolean = false; // 是否处于设置区域的状态
    public points: Vector3[] = []; // 当前绘制的点
    public popPoints: Vector3[] = []; // 绘制后弹出的点

    private isClose: boolean = false; // 是否存在闭合路径

    public move(e: PointerEvent) {
        if (!(this.mgr && this.points.length && this.container)) {
            return;
        }

        this.mgr.lineMgr.remove(ZoneMixin.LINE_NAME);

        const bounding = this.container.getBoundingClientRect();
        const p = this.getCoord(e.x - bounding.left, e.y - bounding.top);
        this.mgr.addLine(
            [...this.points, { ...p, z: 9 }],
            ZoneMixin.LINE_STYLE,
            ZoneMixin.LINE_NAME,
            true
        );
    }

    public addPoint(e: PointerEvent) {
        if (!(this.mgr && this.container)) {
            return;
        }
        if (this.isClose) {
            this.mgr.lineMgr.remove(ZoneMixin.LINE_NAME);
            this.isClose = false;
        }

        const bounding = this.container.getBoundingClientRect();
        const p = this.getCoord(e.x - bounding.left, e.y - bounding.top);

        // ============================判断是否存在相交，有则忽略当前点
        if (this.hasIntersection(p)) {
            return;
        }

        this._addPoint(p);
        this.popPoints.length = 0;
    }

    // 进入绘制模式
    public enterDrawingMode() {
        this.isClose && this.rePaint();

        this.isDrawing = true;
        this.isClose = false;
    }

    // 回撤一个点
    public prev() {
        const p = this.points.pop();
        if (p) {
            this.popPoints.push(p);
            if (this.mgr) {
                this.mgr.remove(JSON.stringify({ x: p.x, y: p.y }));
                this.rePaint();
            }
        }
    }

    // 将回撤的点重新绘制
    public next() {
        const p = this.popPoints.pop();
        p && this._addPoint(p);
    }

    // 清除图形
    public cancel() {
        this.$confirm('清除当前图形并退出绘制模式?')
            .then(() => {
                this.remove();
                this.isDrawing = false;
            })
            .catch(console.log);
    }

    // 确定图形并退出绘制模式
    public ok() {
        this.isClose = true;
        this.rePaint();
        this.mgr && this.mgr.appendLine(ZoneMixin.LINE_NAME, [this.points[0]], true);

        if (this.hasIntersection(this.points[0])) {
            return this.$message.warning('当前图形存在相交线段，请重新设置');
        }

        this.isDrawing = false;
    }

    protected initData() {
        this.points.length = 0;
        this.popPoints.length = 0;
        this.isDrawing = false;
        this.isClose = false;
    }

    protected bindEvents() {
        this.mgr!.on('loadComplete', this.tagAnchor.bind(this));
    }

    /**
     * 移除区域图形
     */
    protected remove() {
        if (this.mgr) {
            this.points.forEach(v => this.mgr!.remove(JSON.stringify({ x: v.x, y: v.y })));
            this.mgr.lineMgr.remove();
        }
        this.points.length = 0;

        return this;
    }

    // 将点的标注及线段添加到地图上
    private _addPoint(p: Vector3) {
        if (!this.mgr) {
            return;
        }

        this.points.push({
            ...this.mgr.addImage(
                {
                    x: p.x,
                    y: p.y,
                    url: '/images/blueImageMarker.png',
                    size: 32,
                    height: 2
                },
                JSON.stringify({ x: p.x, y: p.y })
            ),
            z: 9
        });

        if (this.points.length > 1) {
            if (this.mgr.lineMgr.find(ZoneMixin.LINE_NAME).length) {
                this.mgr.appendLine(ZoneMixin.LINE_NAME, [{ ...p, z: 9 }], true);
            } else {
                this.mgr.addLine(
                    [...this.points],
                    ZoneMixin.LINE_STYLE,
                    ZoneMixin.LINE_NAME,
                    true
                );
            }
        }
    }

    // 是否存在无效点
    private hasIntersection(p: Vector3) {
        const last = this.points[this.points.length - 1];
        if (last) {
            for (let i = 0; i < this.points.length - 1; i++) {
                const { isCollinear, result } = segmentsIntersect(this.points[i], this.points[i + 1], last, p);
                if (result && (isCollinear || this.points[i + 1] !== last && this.points[i] !== p)) {
                    return true;
                }
            }
        }

        return false;
    }

    // 重绘路径
    private rePaint() {
        if (this.mgr) {
            this.mgr.lineMgr.remove(ZoneMixin.LINE_NAME);
            if (this.points.length > 1) {
                this.mgr.addLine(
                    [...this.points],
                    ZoneMixin.LINE_STYLE,
                    ZoneMixin.LINE_NAME,
                    true
                );
            }
        }
    }

    // 获取地图坐标
    private getCoord(x: number, y: number) {
        if (this.mgr instanceof FengMapMgr) {
            return this.mgr.map.coordScreenToMap(x, y, 9);
        }

        if (this.mgr instanceof PIXIMgr) {
            const p = this.mgr.stage.toLocal(new PIXI.Point(x, y));
            return { ...p, z: 9 };
        }

        console.warn('地图错误....');
        return { x, y, z: 9 };
    }
}
