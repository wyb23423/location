/// <reference path="../../types/fengmap.d.ts" />

export interface MapData {
    id: number;
    name: string;
    filepath: string;
    margin: Array<[number, number]>;
}

export interface ZoneData {
    status: string;
    enable: 0 | 1;
    id: number;
    name: string;
    position: Vector2[] | string;
}

export class MapMgr<T> {
    public map!: T;

    public margin?: [Vector2, Vector2, Vector2, Vector2];
    public locOrigion: Vector2 = { x: 0, y: 0 };
    public locRange: Vector2 = { x: 3073, y: 2326 };

    protected makers: Array<fengmap.FMPolygonMarker | fengmap.FMTextMarker> = [];
    protected polygonLayer?: fengmap.FMMakerLayer<fengmap.FMPolygonMarker>;
    protected textLayer?: fengmap.FMMakerLayer<fengmap.FMTextMarker>;

    public zoneOpen(data: ZoneData): void {
        //
    }

    public removeZone(name: string): void {
        //
    }

    protected createPolygonMaker(coords: Vector2[], name: string): void {
        //
    }

    protected addTextMarker(position: Vector2, name: string): void {
        //
    }
}
