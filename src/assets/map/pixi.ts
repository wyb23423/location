/**
 * pixi
 */

export class PIXIMgr {
    public readonly has3D: boolean = false;

    public map!: PIXI.Renderer;

    public margin?: TPosition;
    public locOrigion: Vector2 = { x: 0, y: 0 };
    public locRange: Vector2 = { x: 3073, y: 2326 };

    constructor(bg: string, dom: HTMLElement) {
        this.map = PIXI.autoDetectRenderer({
            width: dom.offsetWidth,
            height: dom.offsetHeight,
            backgroundColor: 0xffffff
        });

        dom.appendChild(this.map.view);


    }

    /**
     * 显示区域
     */
    public zoneOpen(data: IZone) {
        if (!this.margin) {
            return console.error('地图范围为空');
        }

        const zones: Vector2[] = typeof data.position === 'string' ? JSON.parse(data.position) : data.position;
        const height = this.createPolygonMarker(zones, data.name);
        this.addTextMarker({ ...zones[0], height }, data.name);
    }

    /**
     * 移除marker
     */
    public remove(name?: string | number) {
        //
    }

    public on(type: string, callback: any) {
        //
    }

    public addImage(
        opt: any,
        name?: string | number,
        gid?: number,
        isMapCoor: boolean = true
    ) {
        //
    }

    /**
     * 创建多边形
     * @param coords 坐标信息
     * @param name 标识符
     * @param isMapCoor 是否已是显示坐标
     */
    public createPolygonMarker(coords: Vector2[], name: string, isMapCoor: boolean = false) {
        if (!this.margin) {
            console.error('地图范围为空');

            return 0;
        }

        //
    }

    /**
     * 添加文本
     */
    public addTextMarker(
        coord: Vector2 | any,
        name: string,
        isMapCoor: boolean = false
    ): Promise<any> {
        if (!this.margin) {
            return Promise.reject('地图范围为空');
        }

        if (!this.map) {
            return Promise.reject('获取地图失败');
        }

        const newlist = {
            x: coord.x,
            y: coord.y
        };

        return new Promise(() => {
            //
        });
    }

    public dispose() {
        //
    }

    // 移动
    public moveTo(
        name: string | number,
        coord: Vector23,
        time: number = 1, // 动画时间
        update?: (v: Vector2) => void, // 移动时回调
        // tslint:disable-next-line: ban-types
        callback?: Function, // 移动完成时回调
        isMapCoor: boolean = false,
    ) {
        //
    }

    public switchViewMode() {
        // 没有3D模式
    }

    /**
     * 切换元素的显示状态
     * @param name 标识符。默认全部
     * @param isShow 是否显示。默认切换状态
     */
    public show(name?: string | number, isShow?: boolean) {
        //
    }
}
