/**
 * 标注管理器
 */

import { randomNum, randomColor } from '@/assets/utils/util';
import { BaseMarkerMgr } from './base';

export class PolygonMgr extends BaseMarkerMgr<fengmap.FMPolygonMarker> {
    public add(coords: Vector2[], name: string | number, style: IJson = {}) {
        const height: number = style.height || randomNum(3, 6);
        const pm = new fengmap.FMPolygonMarker({
            color: style.color || randomColor(),
            alpha: 0.5,
            lineWidth: 1,
            height,
            points: coords
        });
        this.save(pm, name, 'polygonMarker', style.gid);

        return height;
    }
}

export class TextMgr extends BaseMarkerMgr<fengmap.FMTextMarker> {
    public add(coord: Vector2, name: string, style: IJson = {}): Promise<fengmap.FMTextMarker> {
        return new Promise(resolve => {
            const tm = new fengmap.FMTextMarker({
                fillcolor: '255,0,0',
                fontsize: 20,
                strokecolor: '255,255,0',
                ...style,
                ...coord,
                name,
                callback: () => resolve(tm)
            });

            tm.height = style.height || 0;
            this.save(tm, name, 'textMarker', style.gid);
        });
    }
}


export class ImageMgr extends BaseMarkerMgr<fengmap.FMImageMarker> {
    public add(coord: Vector3, name?: string | number, style: IJson = {}) {
        return new Promise(resolve => {
            const im = new fengmap.FMImageMarker({
                size: 24,
                url: '',
                height: 0,
                ...style,
                ...coord,
                callback: () => resolve(im)
            });
            im.avoid(!!style.avoid);

            this.save(
                im, name || JSON.stringify(coord),
                'imageMarker', style.gid
            );
        });
    }
}

export class LineMgr implements MarkerMgr<fengmap.FMLineMarker> {
    private lines: Map<string | number, fengmap.FMLineMarker> = new Map();

    constructor(public map: fengmap.FMMap) {
        //
    }

    public add(points: Vector3[], name: string | number, style: LineStyle) {
        if (this.lines.has(name)) {
            return console.error(`标识为${name}的线已存在`);
        }

        style.color = style.color || randomColor();
        style.godColor = style.godColor || randomColor();
        style.godEdgeColor = style.godEdgeColor || randomColor();

        const line = new fengmap.FMLineMarker();
        line.custom = { style };
        this.lines.set(name, line);
        this.append(points, name);
    }

    public remove(name?: string | number) {
        if (name == null) {
            this.map.clearLineMark();
            this.lines.clear();
        } else {
            const line = this.lines.get(name);
            if (line) {
                this.map.removeLineMarker(line);
                this.lines.delete(name);
            } else {
                console.warn(`标识为${name}的线未找到`);
            }
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
    }

    public find(name?: string | number) {
        if (name == null) {
            return Array.from(this.lines.values());
        }

        return this.lines.has(name)
            ? [<fengmap.FMLineMarker>this.lines.get(name)]
            : [];
    }
    public dispose() {
        this.map.clearLineMark();
        Reflect.set(this, 'map', null);
        this.lines.clear();
    }

    public append(points: Vector3[], name: string | number) {
        const line = this.lines.get(name);
        if (line) {
            const seg = new fengmap.FMSegment();
            seg.groupId = this.map.focusGroupID;
            seg.points = points;
            line.addSegment(seg);

            this.map.drawLineMark(
                line,
                line.custom && line.custom.style
                    ? line.custom.style
                    : {
                        lineType: fengmap.FMLineType.FULL,
                        lineWidth: 1
                    }
            );
        } else {
            console.warn(`标识为${name}的线未找到`);
        }
    }
}
