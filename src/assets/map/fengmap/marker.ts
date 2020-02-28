/**
 * 标注管理器
 */

import { randomNum, randomColor } from '@/assets/utils/util';
import { BaseMarkerMgr } from './base';
import { getCustomInfo } from '../common';
import { ZONE_SEPARATOR } from '@/constant';

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
                name: name.split(ZONE_SEPARATOR).pop()!,
                callback: () => resolve(tm)
            });
            tm.avoid(!!style.avoid);

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

    public jump(name?: string | number, opt?: JumpOptions) {
        opt = Object.assign(<JumpOptions>{
            height: 2,
            times: 0,
            duration: 1,
            delay: 0
        }, opt || {});

        this.find(name).forEach(v => {
            if (getCustomInfo(v, 'isJump') !== true) {
                console.log(v);
                v.jump(opt!);
                v.custom.isJump = true;
            }
        });
    }

    public stopJump(name?: string | number) {
        this.find(name).forEach(v => {
            v.stopJump();
            (v.custom || (v.custom = {})).isJump = false;
        });
    }
}

export class LineMgr implements MarkerMgr<fengmap.FMLineMarker> {
    private static readonly MAX_SEGMENT_COUNT = 3; // 一条线可包含的最大片段数
    private static readonly MAX_POINT_COUNT = 3000; // 一个片段可包含的最大点数量
    private lines: Map<string | number, fengmap.FMLineMarker> = new Map();

    constructor(private map: fengmap.FMMap) {
        //
    }

    public add(points: Vector3[], name: string | number, style: LineStyle) {
        if (this.lines.has(name)) {
            return;
            // console.error(`标识为${name}的线已存在`);
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
                // console.warn(`标识为${name}的线未找到`);
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
            if (!points.length) {
                return;
            }

            const style = line.custom && line.custom.style
                ? line.custom.style
                : {
                    lineType: fengmap.FMLineType.FULL,
                    lineWidth: 1
                };

            if (line.segment.length >= LineMgr.MAX_SEGMENT_COUNT) {
                // 片段过多合成一条
                for (let i = line.segment.length - 1; i >= 0; i--) {
                    const v = line.segment[i];
                    if (i) {
                        v.points.shift();
                    }

                    points.unshift(...v.points);
                }
                this.remove(name); // 移除原来的线
                this.add(points, name, style); // 创建新的线
            } else {
                const seg = new fengmap.FMSegment();
                seg.groupId = this.map.focusGroupID;

                const last = line.segment[line.segment.length - 1];
                if (last && last.points.length) {
                    points.unshift(last.points[last.points.length - 1]);
                }

                seg.points = points.slice(-LineMgr.MAX_POINT_COUNT);
                line.addSegment(seg);

                try {
                    this.map.drawLineMark(line, style);
                } catch (e) {
                    //
                }
            }
        } else {
            // console.warn(`标识为${name}的线未找到`);
        }
    }
}

export class PopInfo {
    private pop?: fengmap.FMPopInfoWindow;
    private tagNo?: string;
    private el: HTMLElement | null = null;

    private createTime: number = 0;
    private time!: number;

    constructor(map: fengmap.FMMap, marker: fengmap.FMImageMarker) {
        if (marker.custom && marker.custom.info) {
            const info = marker.custom.info;
            const tagNo = this.tagNo = info.name;
            this.pop = new fengmap.FMPopInfoWindow(map, {
                width: 130,
                height: 85,
                content: `<div>
                                <div class="tag-info">
                                    <img src="/images/name.png" />
                                    <span>${info.tagName}</span>
                                </div>
                                <div class="tag-info" style="margin: 5px 0">
                                    <img src="/images/no.png" />
                                    <span>${tagNo}</span>
                                </div>
                                <div class="tag-info" id="${tagNo}" style="opacity: 1">
                                    <img src="/images/heart.png" />
                                    <span>--</span>
                                </div>
                            </div>`
            }, marker);
        }

        this.createTime = this.time = Date.now();
    }

    public updatePosition(map: fengmap.FMMap) {
        return this._update(map, () => map.updatePopPosition(this.pop!));
    }

    public updateInfo(map: fengmap.FMMap, info: ITagInfo) {
        return this._update(map, () => {
            this.updateHeartRate(info.iHeartRate);
        });
    }

    public close(clickTime: number = this.createTime) {
        if (this.pop && Date.now() - clickTime >= 200) {
            try {
                this.el = null;
                this.pop.close();
            } catch (e) {
                //
            }

            return true;
        }
    }

    private _update(map: fengmap.FMMap, func: () => void) {
        try {
            if (map && this.pop && this.tagNo) {
                func();
            }
        } catch (e) {
            return false;
        }

        return true;
    }

    private updateHeartRate(heartRate: number) {
        this.el = this.el || document.getElementById(this.tagNo!);
        if (this.el) {
            const span = <HTMLSpanElement>this.el.children[1];
            span && (span.innerText = `${heartRate}`);

            const now = Date.now();
            if (now - this.time >= 500) {
                const opacity = this.el.style.opacity;
                this.el.style.opacity = opacity === '1' ? '0' : '1';
                this.time = now;
            }
        }
    }
}
