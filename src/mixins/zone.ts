/**
 * 区域
 * 地图操作
 */
import Component, { mixins } from 'vue-class-component';
import MapMixin from './map';
import { FengMapMgr } from '@/assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';

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
        if (!(this.mgr && this.points.length && this.canvas)) {
            return;
        }

        this.mgr.lineMgr.remove(ZoneMixin.LINE_NAME);

        const bounding = this.canvas.getBoundingClientRect();
        const p = this.getCoord(e.x - bounding.left, e.y - bounding.top);
        this.mgr.addLine(
            [...this.points, { ...p, z: 9 }],
            ZoneMixin.LINE_STYLE,
            ZoneMixin.LINE_NAME,
            true
        );
    }

    public addPoint(e: PointerEvent) {
        if (!(this.mgr && this.canvas)) {
            return;
        }
        if (this.isClose) {
            this.mgr.lineMgr.remove(ZoneMixin.LINE_NAME);
            this.isClose = false;
        }

        const bounding = this.canvas.getBoundingClientRect();
        const p = this.getCoord(e.x - bounding.left, e.y - bounding.top);

        // ============================判断是否存在相交，有则忽略当前点
        if (this.hasIntersection(p)) {
            return;
        }
        this._addPoint(p);
    }

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

    // 将回撤的点重现绘制
    public next() {
        const p = this.popPoints.pop();
        p && this._addPoint(p, true);
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

    protected remove() {
        if (this.mgr) {
            this.points.forEach(v => this.mgr!.remove(JSON.stringify({ x: v.x, y: v.y })));
            this.mgr.lineMgr.remove();
        }
        this.points.length = 0;
    }

    // 将点的标注及线段添加到地图上
    private _addPoint(p: Vector3, isNext?: boolean) {
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

        isNext || (this.popPoints.length = 0);
    }

    // 是否存在无效点
    private hasIntersection(p: Vector3) {
        const last = this.points[this.points.length - 1];
        if (last) {
            for (let i = 0; i < this.points.length - 1; i++) {
                const { isCollinear, result } = this.segmentsIntersect(this.points[i], this.points[i + 1], last, p);
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

    // 判断两条线段是否相交
    private segmentsIntersect(a1: Vector3, a2: Vector3, b1: Vector3, b2: Vector3) {
        const t1 = this.cross(a1, a2, b1);
        const t2 = this.cross(a1, a2, b2);
        const t3 = this.cross(b1, b2, a1);
        const t4 = this.cross(b1, b2, a2);
        if (((t1 * t2) > 0) || ((t3 * t4) > 0)) {    // 一条线段的两个端点在另一条线段的同侧，不相交。（可能需要额外处理以防止乘法溢出，视具体情况而定。）
            return { isCollinear: false, result: false };
        } else if (t1 === 0 && t2 === 0) {             // 两条线段共线，利用快速排斥实验进一步判断。此时必有 t3 == 0 && t4 == 0。
            return { isCollinear: true, result: this.rectsIntersect(a1, a2, b1, b2) };
        } else {                                    // 其它情况，两条线段相交。
            return { isCollinear: false, result: true };
        }
    }

    /**
     * 计算两个向量的外积（叉乘）。可以根据结果的符号判断三个点的位置关系
     *
     * @returns
     *  向量AC与向量AB的外积。如果结果为正数，表明点C在直线AB（直线方向为从A到B）的右侧；
     *  如果结果为负数，表明点C在直线AB（直线方向为从A到B）的左侧；如果结果为0，表明点C在直线AB上
     */
    private cross(a: Vector3, b: Vector3, c: Vector3) {
        return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
    }

    /**
     * 快速排斥实验，判断两个线段张成的矩形区域是否相交。
     * @returns 两个线段张成的矩形区域是否相交。具有对称性，即交换两条线段（参数S1与S2交换、E1与E2交换），结果不变
     */
    private rectsIntersect(s1: Vector3, e1: Vector3, s2: Vector3, e2: Vector3) {
        return Math.min(s1.y, e1.y) <= Math.max(s2.y, e2.y)
            && Math.max(s1.y, e1.y) >= Math.min(s2.y, e2.y)
            && Math.min(s1.x, e1.x) <= Math.max(s2.x, e2.x)
            && Math.max(s1.x, e1.x) >= Math.min(s2.x, e2.x);
    }
}
