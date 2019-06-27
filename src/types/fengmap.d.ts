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

interface FMTextMarkerOptions extends Vector23 {
    name: string;
    fontsize: number;
    fillcolor: string;
    strokecolor: string;
    height?: number;
    alpha?: number;
    type?: number;

    // tslint:disable-next-line:ban-types
    callback?: Function;
}

interface FMImageMarkerOptions extends Vector23 {
    size: number;
    height: number;
    url: string;

    // tslint:disable-next-line:ban-types
    callback?: Function;
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

interface MoveOptions extends Vector2 {
    time?: number;

    // tslint:disable-next-line:ban-types
    callback?: Function;
    update?: (v: Vector2) => void;
}


declare namespace fengmap {
    interface FMMap {
        readonly groupIDs: number[];
        focusGroupID: number;
        layerLocalHeight: number;
        mapScene: any;
        viewMode: string;

        gestureEnableController: {
            enableMapHover: boolean;
            enableMapIncline: boolean;
            enableMapPan: boolean;
            enableMapPinch: boolean;
            enableMapRotate: boolean;
            enableMapSingleTap: boolean;
        };

        openMapById(id: string): void;
        getFMGroup(gid: number): FMGroup;
        coordMapToScreen(x: number, y: number): Vector2;


        on(type: string, callback: (e: FMMapClickEvent) => void): void;
        dispose(): void;
    }
    interface FMMapConstructor {
        readonly prototype: ObjectConstructor;
        new(options: FMMapOptions): FMMap;
    }
    const FMMap: FMMapConstructor;

    class FMMarker<T> {
        public custom?: any;
        // tslint:disable:variable-name
        public _x: number;
        public _y: number;
        // tslint:enable:variable-name
        public show: boolean;

        constructor(options: T);

        public alwaysShow(): void;
        public moveTo(opt: MoveOptions): void;
    }

    class FMPolygonMarker extends FMMarker<FMPolygonMarkerOptions> {

    }

    class FMTextMarker extends FMMarker<FMTextMarkerOptions> {
        public name: string;
        public height: number;
    }

    class FMImageMarker extends FMMarker<FMImageMarkerOptions> {

    }

    interface FMGroup {
        groupHeight: number;

        getOrCreateLayer<T>(layerAlias: string): FMMarkerLayer<T>;
    }

    interface FMMarkerLayer<T> {
        textMarkers: FMTextMarker[];

        addMarker(marker: T): void;
        removeMarker(marker: T): void;
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
