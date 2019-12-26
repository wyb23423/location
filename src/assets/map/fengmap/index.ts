/**
 * fengmap
 */
import { MAP_THEME_URL, APP_KEY, APP_NAME, MAP_DATA_URL, ZONE_SEPARATOR } from '@/constant';
import { CoordTransformer } from './coordtransformer';
import { PolygonMgr, TextMgr, ImageMgr, LineMgr, PopInfo } from './marker';
import { getCustomInfo } from '../common';

export class FengMapMgr extends CoordTransformer {
    public readonly has3D: boolean = true;
    public map!: fengmap.FMMap;

    public lineMgr!: LineMgr;
    public polygonMgr!: PolygonMgr;
    public textMgr!: TextMgr;
    public imageMgr!: ImageMgr;

    private isLoaded: boolean = false;

    constructor(name: string, dom: HTMLElement) {
        super();

        dom.innerHTML = '';

        this.map = new fengmap.FMMap({
            // 渲染dom
            container: dom,
            // 地图数据位置
            mapServerURL: MAP_DATA_URL,
            // 主题数据位置
            mapThemeURL: MAP_THEME_URL,
            // 设置主题
            defaultThemeName: name,
            defaultViewMode: fengmap.FMViewMode.MODE_2D,
            // 开发者申请应用下web服务的key
            key: APP_KEY,
            // 开发者申请应用名称
            appName: APP_NAME,
            preserveDrawingBuffer: true,
            defaultMapScaleLevel: 22
        });
        this.map.openMapById(name);
        this.map.on('loadComplete', () => {
            this.isLoaded = true;
            this.map.rotateTo({ to: 0, duration: 0.5 });
        });

        this.init();
    }

    /**
     * 显示区域
     */
    public zoneOpen(data: IZone) {
        if (!this.margin) {
            return console.error('地图范围为空');
        }

        let zones = typeof data.position === 'string' ? JSON.parse(data.position) : data.position;
        zones = zones.coordinates || zones;

        const name = data.id + ZONE_SEPARATOR + data.name;
        const height = this.createPolygonMarker(zones, name);
        this.addTextMarker({ ...zones[0], height }, name);
    }

    /**
     * 移除marker
     */
    public remove(name?: string | number) {
        this.polygonMgr.remove(name);
        this.textMgr.remove(name);
        this.imageMgr.remove(name);
    }

    public on(type: string, callback: any) {
        this.map.on(type, (e: FMMapClickEvent) => {
            if (e.eventInfo && this.map && e.eventInfo.coord) {
                const { coord, domEvent } = e.eventInfo;
                // ===============================处理移动端时的坐标误差
                if (domEvent instanceof TouchEvent) {
                    coord.x -= 2.8;
                    coord.y += 1.4;
                }

                e.data = { global: this.map.coordMapToScreen(coord.x, coord.y) };
                console.log(this.getCoordinate(coord));
            }

            callback(e);
        });
    }

    public addImage(
        opt: any,
        name?: string | number,
        gid: number = this.map.focusGroupID,
        isMapCoor: boolean = true
    ): Vector3 {
        const group = this.map.getFMGroup(gid);
        let p: Vector3 | undefined = {
            x: opt.x,
            y: opt.y,
            z: opt.z || group.groupHeight + this.map.layerLocalHeight || 0
        };

        if (!isMapCoor) {
            p = <Vector3 | undefined>this.parseCood(p);
            if (!p) {
                return { x: 0, y: 0, z: 0 };
            }
        }

        this.imageMgr.add(p, name, { ...opt, gid })
            .then(im => opt.callback && opt.callback(im));

        return p;
    }

    public modifyImg(name: string | number, img?: string) {
        this.imageMgr.find(name).forEach(v => {
            img = img || getCustomInfo<ITag>(v, 'info').icon;
            img && (v.url = img);
        });
    }

    public createPolygonMarker(
        coords: Vector2[],
        name: string,
        isMapCoor: boolean = false,
        gid?: number
    ) {
        if (!isMapCoor) {
            (<any>coords) = this.parseCood(coords);
            if (!coords) {
                return 0;
            }
        }

        return this.polygonMgr.add(coords, name, { gid });
    }

    public addTextMarker(
        coord: Vector2 & IJson,
        name: string,
        isMapCoor: boolean = false,
        gid?: number
    ): Promise<any> {
        if (!name) {
            return Promise.reject('no text');
        }

        let newlist: Vector23 | undefined = {
            x: coord.x || coord.xaxis || 0,
            y: coord.y || coord.yaxis || 0
        };

        if (!isMapCoor) {
            newlist = <Vector3 | undefined>this.parseCood(newlist);
            if (!newlist) {
                return Promise.reject();
            }
        }

        return this.textMgr.add(newlist, name, { ...coord, gid });
    }

    public dispose() {
        const fn = () => {
            ['polygonMgr', 'textMgr', 'imageMgr', 'lineMgr', 'map'].forEach(k => {
                Reflect.get(this, k).dispose();
                Reflect.set(this, k, null);
            });
        };

        if (this.isLoaded) {
            fn();
        } else {
            this.map.on('loadComplete', fn);
        }
    }

    // 移动marker
    public moveTo(
        name: string | number,
        coord: Vector23,
        time: number = 1,
        update?: (v: Vector2) => void,
        callback?: (v: any) => void,
        isMapCoor: boolean = false,
    ) {
        if (!isMapCoor) {
            (<any>coord) = this.parseCood(coord);
            if (!coord) {
                return;
            }
        }

        this.polygonMgr.moveTo(name, coord, time, update, callback);
        this.textMgr.moveTo(name, coord, time, update, callback);
        this.imageMgr.moveTo(name, coord, time, update, callback);
    }

    // 停止移动动画
    public stopMoveTo(name?: string | number) {
        this.polygonMgr.stopMoveTo(name);
        this.textMgr.stopMoveTo(name);
        this.imageMgr.stopMoveTo(name);
    }

    // 2D与3D切换
    public switchViewMode(mode?: fengmap.FMViewMode.MODE_2D | fengmap.FMViewMode.MODE_3D) {
        try {
            if (mode) {
                return this.map.viewMode = mode;
            }

            if (this.map.viewMode === fengmap.FMViewMode.MODE_2D) {
                this.map.viewMode = fengmap.FMViewMode.MODE_3D;
            } else {
                this.map.viewMode = fengmap.FMViewMode.MODE_2D;
            }
        } catch (e) {
            //
        }
    }

    // 控制marker的显示与隐藏
    public show(name?: string | number, isShow?: boolean) {
        this.polygonMgr.show(name, isShow);
        this.textMgr.show(name, isShow);
        this.imageMgr.show(name, isShow);
    }

    // 添加线
    public addLine(
        points: Vector3[],
        lineStyle: LineStyle,
        name: string | number,
        isMapCoor: boolean = false
    ) {
        if (!isMapCoor) {
            (<any>points) = this.parseCood(points);
            if (!points) {
                return;
            }
        }

        this.lineMgr.add(points, name, lineStyle);
    }
    // 为一条线添加片段
    public appendLine(name: string | number, points: Vector3[], isMapCoor: boolean = false) {
        if (!isMapCoor) {
            (<any>points) = this.parseCood(points);
            if (!points) {
                return;
            }
        }

        this.lineMgr.append(points, name);
    }

    // 为标签添加信息添加弹窗
    public addPopInfo(marker: fengmap.FMImageMarker) {
        const pop = new PopInfo(this.map, marker);

        return {
            updatePosition: () => pop.updatePosition(this.map),
            updateInfo: (info: ITagInfo) => pop.updateInfo(this.map, info),
            close: pop.close.bind(pop)
        };
    }

    // 查找标记为name的marker
    public find(name?: string | number, isName: boolean = false) {
        const markers: Array<fengmap.FMMarker<any>> = [];
        markers.push(
            ...this.polygonMgr.find(name, isName),
            ...this.textMgr.find(name, isName),
            ...this.imageMgr.find(name, isName),
        );

        return markers;
    }

    private init() {
        this.polygonMgr = new PolygonMgr(this.map);
        this.textMgr = new TextMgr(this.map);
        this.imageMgr = new ImageMgr(this.map);
        this.lineMgr = new LineMgr(this.map);
    }
}
