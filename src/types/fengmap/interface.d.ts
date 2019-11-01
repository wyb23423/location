
interface PointData extends Vector2 {
    value: number;
}

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

    preserveDrawingBuffer?: boolean;
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

interface JumpOptions {
    height: number;
    times?: number;
    duration: number;
    delay: number;
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
