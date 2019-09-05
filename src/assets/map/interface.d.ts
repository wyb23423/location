declare interface MarkerMgr<T> {
    add(coords: Vector23 | Vector23[], name: string, style?: IJson): any;
    remove(name?: string | number): void;
    moveTo(
        name: string | number,
        coord: Vector23,
        time?: number,
        update?: (v: Vector2) => void,
        callback?: () => void
    ): void;
    stopMoveTo(name?: string | number): void;
    show(name?: string | number, isShow?: boolean): void;
    find(name?: string | number, isName?: boolean): T[];
    dispose(): void;
}

declare interface HeatMapConfig {
    gradient?: object;
    radius?: number;
    min?: number;
    max?: number;
    maxSize?: number;
    opacity?: number;
}
