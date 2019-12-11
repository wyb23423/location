/**
 * 标注管理器基类
 */

import { none } from '@/assets/utils/util';
import { getCustomInfo } from '../common';

export class BaseMarkerMgr<T extends fengmap.FMMarker<any>> implements MarkerMgr<T> {
    private layers: Map<string, fengmap.FMMarkerLayer<T>> = new Map();
    private markers: Map<string | number, T[]> = new Map();
    private naviAnalyser?: fengmap.FMNaviAnalyser;

    constructor(private map: fengmap.FMMap) {
        // map.on('loadComplete', () => this.naviAnalyser = new fengmap.FMNaviAnalyser(map));
    }

    public add(coords: Vector23 | Vector23[], name: string, style?: IJson) {
        throw new ReferenceError('Method BaseMarkerMgr.prototype.add is not defined');
    }

    public remove(name?: string | number) {
        this.find(name).forEach(v => {
            v.stopMoveTo && v.stopMoveTo();
            v instanceof fengmap.FMImageMarker && v.stopJump();

            const layer = this.findLayerByMarker(v);
            layer && layer.removeMarker(v);
        });

        if (name == null) {
            this.markers.clear();
        } else {
            this.markers.delete(name);
        }
    }

    public moveTo(
        name: string | number,
        coord: Vector23,
        time: number = 1,
        update?: (v: Vector2) => void,
        callback?: (v: fengmap.FMMarker) => void
    ) {
        const fn = (item: fengmap.FMMarker, points: Array<Vector2 & { time: number }>) => {
            const p = points.shift();
            if (!p) {
                return (callback || none)(item);
            }

            item.moveTo({
                ...p,
                update: update || none,
                callback: fn.bind(null, item, points)
            });
        };

        this.find(name).forEach(v => {
            if (v.stopMoveTo) {
                v.stopMoveTo();
                (<any>v)._isMoving = false;
            }

            fn(v, this.analyzeNavi(coord, time, v));
        });
    }

    public stopMoveTo(name?: string | number) {
        this.find(name).forEach(marker => marker.stopMoveTo && marker.stopMoveTo());
    }

    public show(name?: string | number, isShow?: boolean) {
        this.find(name).forEach(marker => marker.show = isShow == null ? !marker.show : isShow);
    }

    /**
     * 查找标记为name的元素
     * @param isName 是否通过tagName查找
     */
    public find(name?: string | number, isName: boolean = false) {
        if (name == null) {
            return Array.from(this.markers.values()).flat();
        }

        if (isName) {
            const result: T[][] = [];
            this.markers.forEach(v => result.push(
                v.filter(m => getCustomInfo<{ tagName: string }>(m, 'info').tagName === name))
            );

            return result.flat();
        } else {
            return this.markers.get(name) || [];
        }
    }

    public dispose() {
        Reflect.set(this, 'map', null);
        this.naviAnalyser && this.naviAnalyser.dispose();
        this.layers.forEach(v => v.removeAll());
        this.layers.clear();
        this.markers.clear();
    }

    protected save(marker: T, name: string | number, layerName: string, gid?: number) {
        // 获取layer
        gid = gid == null
            ? this.map.focusGroupID == null
                ? this.map.groupIDs[0]
                : this.map.focusGroupID
            : gid;

        let layer = this.layers.get(layerName + gid);
        if (!layer) {
            const group = this.map.getFMGroup(gid);
            layer = group.getOrCreateLayer(layerName);
            this.layers.set(layerName + gid, layer);
        }

        // 将layerName绑定到marker上
        (marker.custom || (marker.custom = {})).layerName = layerName;

        layer.addMarker(marker);
        const arr = this.markers.get(name) || [];
        arr.push(marker);
        this.markers.set(name, arr);
    }

    private findLayerByMarker(marker: T) {
        if (marker.custom && marker.custom.layerName) {
            const layer = this.layers.get(marker.custom.layerName + marker.groupID);
            if (layer) {
                return layer;
            } else {
                console.error('图层未找到');
            }
        } else {
            console.error('图层名不存在, 无法查询图层');
        }
    }

    private analyzeNavi(coord: Vector23, time: number, item: fengmap.FMMarker) {
        const points = [{ ...coord, time }];
        if (this.naviAnalyser) {
            const result = this.naviAnalyser.analyzeNavi(item.groupID, item.mapCoord, item.groupID, <Vector3>coord);
            if (result === fengmap.FMRouteCalcuResult.ROUTE_SUCCESS) {
                const data = this.naviAnalyser.getNaviResults();
                const descriptions = this.naviAnalyser.getRouteDescriptions(data);

                let distance = points.length = 0;
                descriptions.naviDescriptionsData.forEach(d => {
                    distance += d.distance;
                    const t = time * distance / descriptions.naviDistance;
                    if (t > 1e-5) {
                        distance = 0;
                        points.push({
                            x: d.endPoint.x,
                            y: d.endPoint.y,
                            time: t
                        });
                    }
                });
            }
        }

        return points;
    }
}
