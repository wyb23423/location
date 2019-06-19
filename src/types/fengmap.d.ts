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

interface FMTextMarkerOptions extends Vector2 {
    name: string;
    fontsize: number;
    fillcolor: string;
    strokecolor: string;
    alpha?: number;
}

interface FMImageMarkerOptions extends Vector23 {
    size: number;
    height: number;
    url: string;
}

interface FMMapClickEvent {
    type: string;
    target: fengmap.FMNode;
    eventInfo: {
        coord: Vector3;
        domEvent: MouseEvent;
    };
    nodeType: number;
}


declare namespace fengmap {
    interface FMMap {
        readonly groupIDs: number[];
        focusGroupID: number;
        layerLocalHeight: number;

        openMapById(id: string): void;
        getFMGroup(gid: number): FMGroup;

        on(type: string, callback: (e: FMMapClickEvent) => void): void;
        dispose(): void;
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

    class FMImageMarker {
        public custom?: any;

        constructor(options: FMImageMarkerOptions);
    }

    interface FMGroup {
        groupHeight: number;

        getOrCreateLayer<T>(layerAlias: string): FMMakerLayer<T>;
    }

    interface FMMakerLayer<T> {
        addMarker(maker: T): void;
        removeMarker(maker: T): void;
        removeAll(): void;
    }

    interface FMNode extends Vector3 {
        FID: string;
        groupID: number;
        height: number;
        typeID: number;
        mapCoord: Vector3;
        show: boolean;
        minlevel: number;
        maxlevel: number;
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

    enum FMNodeType {
        ALL = 0xffff,
        EXTENT = 4,
        EXTERANL_MODEL = 35,
        FACILITY = 11,
        IMAGE_MARKER = 31,
        LABEL = 12,
        LINE = 21,
        LOCATION_MARKER = 33,
        MODEL = 5,
        NONE = 0,
        POLYGON_MARKER = 36,
        TEXT_MARKER = 32
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
