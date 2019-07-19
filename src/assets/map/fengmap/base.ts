/**
 * 标注管理器基类
 */

import { none } from '@/assets/utils/util';

export class BaseMarkerMgr<T extends fengmap.FMMarker<any>> implements MarkerMgr<T> {
    private layers: Map<string, fengmap.FMMarkerLayer<T>> = new Map();
    private markers: Map<string | number, T[]> = new Map();

    constructor(protected map: fengmap.FMMap) {
        //
    }

    public add(coords: Vector23 | Vector23[], name: string, style?: IJson) {
        throw new ReferenceError('Method BaseMarkerMgr.prototype.add is not defined');
    }

    public remove(name?: string | number) {
        if (name == null) {
            this.layers.forEach(layer => layer.removeAll());
            this.markers.clear();
        } else if (this.markers.has(name)) {
            (<T[]>this.markers.get(name)).forEach(v => {
                const layer = this.findLayerByMarker(v);
                layer && layer.removeMarker(v);
            });
            this.markers.delete(name);
        }
    }

    public moveTo(
        name: string | number,
        coord: Vector23,
        time: number = 1,
        update?: (v: Vector2) => void,
        callback?: () => void
    ) {
        const arr = this.markers.get(name);
        if (arr) {
            arr.forEach(v => {
                v.moveTo({
                    time,
                    x: coord.x,
                    y: coord.y,
                    callback: callback || none,
                    update: update || none
                });
            });
        }
    }

    public stopMoveTo(name?: string | number) {
        this.find(name).forEach(marker => marker.stopMoveTo && marker.stopMoveTo());
    }

    public show(name?: string | number, isShow?: boolean) {
        this.find(name).forEach(marker => marker.show = isShow == null ? !marker.show : isShow);
    }

    public find(name?: string | number) {
        if (name == null) {
            return Array.from(this.markers.values()).flat();
        }

        return this.markers.get(name) || [];
    }

    public dispose() {
        Reflect.set(this, 'map', null);
        this.layers.clear();
        this.markers.clear();
    }

    protected save(marker: T, name: string | number, layerName: string, gid: number) {
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
        const custom = marker.custom || {};
        custom.layerName = layerName;
        marker.custom = custom;

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
}
