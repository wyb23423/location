/**
 * 线条绘制
 */
import * as PIXI from 'pixi.js';
import { randomNum } from '@/assets/utils/util';

export default class LineMgr implements MarkerMgr<PIXI.Graphics> {
    private lines: Map<string | number, PIXI.Graphics> = new Map();

    constructor(private stage: PIXI.Container) {
        //
    }

    public add(points: Vector3[], name: string | number, style: LineStyle) {
        if (this.lines.has(name)) {
            return console.error(`标识为${name}的线已存在`);
        }

        const painter = new PIXI.Graphics();
        painter.lineStyle(
            style.lineWidth,
            style.colorNum == null ? randomNum(0, 0xffffff) : style.colorNum,
            style.alpha
        );
        this.lines.set(name, painter);

        if (points.length) {
            (<any>painter).start = <Vector3>points.shift();
            this.append(points, name);
        }

        this.stage.addChild(painter);
        this.stage.sortChildren();
    }

    public remove(name?: string | number) {
        this.find(name).forEach(v => this.stage.removeChild(v));
        if (name != null) {
            this.lines.delete(name);
        } else {
            this.lines.clear();
        }
    }

    public moveTo() {
        throw new ReferenceError('Method LineMgr.prototype.moveTo is not defined');
    }
    public stopMoveTo(name?: string | number) {
        throw new ReferenceError('Method LineMgr.prototype.stopMoveTo is not defined');
    }
    public show(name?: string | number, isShow?: boolean) {
        throw new ReferenceError('Method LineMgr.prototype.show is not defined');
        // this.find(name).forEach(v => v.visible = isShow == null ? !v.visible : isShow);
    }

    public find(name?: string | number) {
        if (name == null) {
            return Array.from(this.lines.values());
        }

        return this.lines.has(name)
            ? [<PIXI.Graphics>this.lines.get(name)]
            : [];
    }
    public dispose() {
        this.remove();
        Reflect.set(this, 'stage', null);
    }
    public append(points: Vector3[], name: string | number) {
        const line = this.lines.get(name);
        if (line) {
            if (points.length) {
                const start: Vector3 = (<any>line).start || points.shift();
                start && line.moveTo(start.x, start.y);

                for (const v of points.slice(-10000)) {
                    line.lineTo(v.x, v.y);
                }

                const end = (<any>line).start = <Vector3>points.pop();
                line.lineTo(end.x, end.y);
            }
        } else {
            // console.warn(`标识为${name}的线未找到`);
        }
    }
}
