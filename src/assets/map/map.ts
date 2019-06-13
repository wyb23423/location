/// <reference path="../../types/fengmap.d.ts" />

export interface MapData {
    id: number;
    name: string;
    filepath: string;
    margin: Array<[number, number]>;
}

export interface ZoneData {
    status?: string;
    enable: 0 | 1;
    id?: number;
    name: string;
    position: Vector2[] | string;
}

export class MapMgr<T> {
    public map!: T;

    public margin?: [Vector2, Vector2, Vector2, Vector2];
    public locOrigion: Vector2 = { x: 0, y: 0 };
    public locRange: Vector2 = { x: 3073, y: 2326 };

    public zoneOpen(data: ZoneData): void {
        //
    }
    public remove(name: string): void {
        //
    }

    // tslint:disable-next-line: ban-types
    public on(type: string, callback: Function) {
        //
    }
    public addImage(opt: any, url: string, name: string | number): Vector3 {
        return { x: 1, y: 1, z: 0 };
    }

    public createPolygonMaker(coords: Vector2[], name: string, isMapCoor: boolean): void {
        //
    }
    public addTextMarker(position: Vector2, name: string, isMapCoor: boolean): void {
        //
    }

    public dispose() {
        //
    }
}
