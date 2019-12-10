/// <reference path="./interface.d.ts" />

/**
 * fengmap类型声明(简)
 * 只声明了项目中需要用的
 */

declare namespace fengmap {
    class FMMarker<T = any> {
        public custom?: any;
        public groupID: number;
        public mapCoord: Vector3;
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

    interface FMMarkerLayer<T> {
        textMarkers: FMTextMarker[];

        addMarker(marker: T): void;
        removeMarker(marker: T): void;
        removeAll(): void;
    }

    interface FMGroup {
        groupHeight: number;
        getOrCreateLayer<T>(layerAlias: string): FMMarkerLayer<T>;

        applyHeatMap(instance: IFMHeatMap): void; // 生成热力图
        removeHeatMap(instance: IFMHeatMap): void; // 移除热力图
    }

    interface IFMHeatMap {
        addPoint(x: number, y: number, value: number): void;
        addPoints(datas: PointData[]): void;
        clearPoints(): void;
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

    interface FMNaviResult {
        readonly groupId: number;
        readonly length: number;
        readonly pointList: Vector3[];
    }
}


declare namespace fengmap {
    class FMMap {
        public readonly groupIDs: number[];
        public focusGroupID: number;
        public layerLocalHeight: number;
        public mapScene: any;
        public viewMode: string;
        public mapScale: number;
        public mapScaleLevel: number;

        public gestureEnableController: {
            enableMapHover: boolean;
            enableMapIncline: boolean;
            enableMapPan: boolean;
            enableMapPinch: boolean;
            enableMapRotate: boolean;
            enableMapSingleTap: boolean;
        };

        constructor(options: FMMapOptions);

        public openMapById(id: string): void;
        public getFMGroup(gid: number): FMGroup;
        public coordMapToScreen(x: number, y: number, z?: number, isFloat?: boolean, giveMeRaw?: boolean): Vector2;
        public coordScreenToMap(x: number, y: number, z: number, isFloat?: boolean, giveMeRaw?: boolean): Vector3;
        public drawLineMark(line: FMLineMarker, style: LineStyle): void;
        public clearLineMark(): void;
        public removeLineMarker(line: FMLineMarker): void;
        public updatePopPosition(w: FMPopInfoWindow): void;

        public on(type: string, callback: (e: FMMapClickEvent) => void): void;
        public dispose(): void;
        public rotateTo(param: { to: number; duration?: number; callback?: () => void }): void;
    }

    class FMPolygonMarker extends FMMarker<FMPolygonMarkerOptions> {

    }

    class FMTextMarker extends FMMarker<FMTextMarkerOptions> {
        public name: string;
        public height: number;
        public avoid(value: boolean): void;
    }

    class FMImageMarker extends FMMarker<FMImageMarkerOptions> {
        public url: string;
        public avoid(value: boolean): void;
        public stopJump(): void;
        public jump(opt: JumpOptions): void;
    }

    class FMSegment {
        public allLength: number;
        public groupId: number;
        public points: Vector3[];
    }

    class FMLineMarker {
        public custom?: any;
        public show: boolean;
        public readonly segment: FMSegment[];

        public addSegment(seg: FMSegment): void;
    }

    class FMPopInfoWindow {
        constructor(map: FMMap, ctrlOpts: PopInfoOptions, marker?: FMImageMarker);
        public close(): void;
    }

    class FMNaviAnalyser {
        constructor(map: FMMap);
        public dispose(): void;
        public getNaviResults(): FMNaviResult[];
        public analyzeNavi(
            startGroupId: number, start: Vector3,
            endGroupId: number, end: Vector3,
            mode?: FMNaviMode,
            priority?: FMNaviPriority
        ): FMRouteCalcuResult;

        public getRouteDistance(navResults?: FMNaviResult[]): number;
        public getRouteDescriptions(navResults?: FMNaviResult[], params?: GetRouteDescriptionParams): RouteDescription;
        public getRouteAllPoints(naviResults?: FMNaviResult[]): Vector3[];
        public getRouteGroupIds(naviResults?: FMNaviResult[]): number[];
        public getRouteGroupPoints(groupId: number, naviResults?: FMNaviResult[]): Vector3[];
        public getRouteLineSegments(naviResults?: FMNaviResult[]): FMSegment[];
    }

    const FMHeatMap: {
        create(map: FMMap, config: HeatMapConfig): IFMHeatMap
    };
}

declare namespace fengmap {
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

    enum FMRouteCalcuResult {
        ROUTE_FAILED_CANNOT_ARRIVE = 9,
        ROUTE_FAILED_CANNOT_CALCULATE = 8,
        ROUTE_FAILED_NO_DATA_END = 5,
        ROUTE_FAILED_NO_DATA_START = 4,
        ROUTE_FAILED_NO_FMDBDATA = 2,
        ROUTE_FAILED_NO_STAIR = 6,
        ROUTE_FAILED_NOTSUPPORT = 7,
        ROUTE_FAILED_TOO_CLOSE = 3,
        ROUTE_SUCCESS = 1
    }

    enum FMNaviMode {
        MODULE_BEST = 2,
        MODULE_SHORTEST = 1
    }

    enum FMNaviPriority {
        PRIORITY_DEFAULT = 1,
        PRIORITY_ESCALATORFIRST = 3,
        PRIORITY_ESCALATORONLY = 6,
        PRIORITY_LIFTFIRST = 2,
        PRIORITY_LIFTONLY = 5,
        PRIORITY_STAIRFIRST = 4,
        PRIORITY_STAIRONLY = 7
    }

    enum FMLanguageType {
        EN = 'en',
        ZH = 'zh'
    }
}

declare module 'fengmap' {
    export = fengmap;
}

