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
    target: fengmap.FMMarker<any>;
    eventInfo: {
        coord: Vector3;
        domEvent: MouseEvent;
    };
    nodeType: number;
    data?: {
        global: Vector2
    };
}

interface MoveOptions extends Vector2 {
    time?: number;

    // tslint:disable-next-line:ban-types
    callback?: Function;
    update?: (v: Vector2) => void;
}


interface PopInfoMapCoord extends Vector2 {
    grounpID: number;
    height?: number;
}
interface PopInfoOptions {
    mapCoord?: PopInfoMapCoord;
    width: number;
    height: number;
    content: string;
    closeCallBack?: () => void;
}

interface LineStyle {
    lineType: string;
    lineWidth: number;
    color?: string;
    colorNum?: number;
    smooth?: boolean;
    godColor?: string;
    godEdgeColor?: string;
    noAnimate?: boolean;
    alpha?: number;
    dash?: {
        size: number;
        gap: number;
    };
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
        coordMapToScreen(x: number, y: number, z?: number, isFloat?: boolean, giveMeRaw?: boolean): Vector2;
        drawLineMark(line: FMLineMarker, style: LineStyle): void;
        clearLineMark(): void;
        removeLineMarker(line: FMLineMarker): void;
        updatePopPosition(w: FMPopInfoWindow): void;

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
        public groupID: number;
        // tslint:disable:variable-name
        public _x: number;
        public _y: number;
        // tslint:enable:variable-name
        public show: boolean;
        constructor(options: T);

        public alwaysShow(): void;
        public stopMoveTo(): void;
        public moveTo(opt: MoveOptions): void;
    }

    class FMPolygonMarker extends FMMarker<FMPolygonMarkerOptions> {

    }

    class FMTextMarker extends FMMarker<FMTextMarkerOptions> {
        public name: string;
        public height: number;
        public avoid(value: boolean): void;
    }

    class FMImageMarker extends FMMarker<FMImageMarkerOptions> {
        public avoid(value: boolean): void;
    }

    class FMSegment {
        public allLength: number;
        public groupId: number;
        public points: Vector3[];
    }

    class FMLineMarker {
        public custom?: any;

        public addSegment(seg: FMSegment): void;
    }

    class FMPopInfoWindow {
        constructor(map: FMMap, ctrlOpts: PopInfoOptions, marker?: FMImageMarker);
        public close(): void;
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

    enum FMLineType {
        CENTER = 'center',
        DASH = 'dash',
        DOT_DASH = 'dotDash',
        DOTTED = 'dotted',
        DOUBLE_DOT_DASH = 'doubleDotDash',
        FMARROW = 'fmarrow',
        FULL = 'full',
        TRI_DOT_DASH = 'triDotDash'
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
