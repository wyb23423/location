/**
 * fengmap类型声明(简)
 * 只声明了项目中需要用的
 */
interface FMMapOptions {
    container: HTMLElement;
    appName: string;
    key: string;

    defaultMapScaleLevel?: number;
    defaultMapScale?: number;

    mapServerURL?: string;
    mapThemeURL?: string;
    defaultThemeName?: string;
    viewModeAnimateMode?: boolean;
    defaultViewMode?: fengmap.FMViewMode.MODE_2D | fengmap.FMViewMode.MODE_3D;
}

interface PolygonOpt {
    type?: 'circle' | 'rectangle';
    center?: Vector2;
    radius?: number;
    segments: number;
    startPoint: Vector2;
    width?: number;
    height?: number;
}
interface FMPolygonMarkerOptions {
    lineWidth: number;
    points: Vector23[] | PolygonOpt;

    height?: number;
    alpha?: number;
    color?: string;
}

interface FMTextMarkerOptions {
    x: number;
    y: number;
    name: string;
    fontsize: number;
    fillcolor: string;
    strokecolor: string;
    alpha?: number;
}

declare namespace fengmap {
    interface FMMap {
        readonly groupIDs: number[];

        openMapById(id: string): void;
        getFMGroup(gid: number): FMGroup;
    }
    interface FMMapConstructor {
        readonly prototype: ObjectConstructor;
        new(options: FMMapOptions): FMMap;
    }
    const FMMap: FMMapConstructor;

    class FMPolygonMarker {
        public custom?: any;

        constructor(options: FMPolygonMarkerOptions);
    }

    class FMTextMarker {
        public name: string;

        constructor(options: FMTextMarkerOptions);
    }

    interface FMGroup {
        getOrCreateLayer<T>(layerAlias: string): FMMakerLayer<T>;
    }

    interface FMMakerLayer<T> {
        addMarker(maker: T): void;
        removeMarker(maker: T): void;
        removeAll(): void;
    }

    enum FMDirection {
        EAST = 'e',
        NORTH = 'n',
        NORTH_EAST = 'ne',
        NORTH_WEST = 'nw',
        SOUTH = 's',
        SOUTH_EAST = 'se',
        SOUTH_WEST = 'sw',
        WEST = 'w'
    }

    enum FMViewMode {
        MODE_2D = 'top',
        MODE_3D = '3d'
    }
}
declare module 'fengmap' {
    export = fengmap;
}

declare interface Vector2 {
    x: number;
    y: number;
}
declare interface Vector3 extends Vector2 {
    z: number;
}
declare interface Vector23 extends Vector2 {
    z?: number;
}
