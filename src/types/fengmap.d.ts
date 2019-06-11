/**
 * fengmap类型声明(简)
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

declare namespace fengmap {
    interface FMMap {
        openMapById(id: string): void;
    }
    interface FMMapConstructor {
        readonly prototype: ObjectConstructor;
        new(options: FMMapOptions): FMMap;
    }
    const FMMap: FMMapConstructor;

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
