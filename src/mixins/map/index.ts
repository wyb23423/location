import Component from 'vue-class-component';
import { loopAwait, Async } from '@/assets/utils/util';
import { createMap } from '@/assets/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import MapSelect from '@/components/form/MapSelect.vue';
import { PIXIMgr } from '@/assets/map/pixi';
import { Ref } from 'vue-property-decorator';
import { errorStore } from '@/components/notice/init';
import { ERROR_IMG, BASE_ERROR_IMG } from '@/constant';
import { Loading } from '../loading';
import { PIXIEL } from '@/assets/map/pixi/animation';
import { GET_BASE } from '@/constant/request';

@Component({
    components: {
        'map-select': MapSelect,
    }
})
export default class MapMixin extends Loading {
    public mgr?: FengMapMgr | PIXIMgr;
    public showPath: boolean = false;
    public linePointsCount = 3000; // 轨迹线包含的最大点数量

    public groups: string[] = []; // 当前地图关联组号
    public mapId?: number;

    @Ref('map') protected readonly container?: HTMLElement;
    protected readonly ICON_TYPE = ICON_TYPE;

    private twinkleTimer = new Map<string, number>();

    public beforeDestroy() {
        this._dispose();
        // 关闭遮罩
        this.loaded();
    }

    public async selectMap(data: IMap) {
        if (data) {
            this.groups = data.groupIds;
            this.mapId = data.id;
        }
        this.initData(data);

        if (!(await this.initMap(data))) {
            this.loaded();
        }
    }

    // 存在性检测的动画
    protected exitAnimation(tagNo: string) {
        if (!this.mgr) {
            return;
        }

        this.mgr.stopMoveTo(tagNo);
        if (!this.twinkleTimer.has(tagNo)) {
            const loop = () => {
                this.mgr && this.mgr.show(tagNo);
                this.twinkleTimer.set(tagNo, window.setTimeout(loop, 200));
            };
            loop();
        }
    }

    protected moveTo(
        tagNo: string, coord: Vector3, time: number,
        update?: () => void, callback?: (v: PIXIEL | fengmap.FMMarker) => void
    ) {
        this.beforeMove(tagNo);

        return new Promise(resolve => {
            if (!this.mgr) {
                return resolve();
            }

            const points: Vector3[] = [];
            const updatehandler = (v: Vector2) => {
                update && update();

                points.push({ x: v.x, y: v.y, z: 1.1 });
                if (this.mgr && points.length >= 5) {
                    this.mgr.appendLine(tagNo, points, true, this.linePointsCount);
                    this.link(tagNo, points.pop()!);
                    points.length = 0;
                }
            };
            const callbackFunc = (v: PIXIEL | fengmap.FMMarker) => {
                callback && callback(v);
                resolve();
            };

            this.mgr.moveTo(tagNo, coord, time, updatehandler, callbackFunc);
        });
    }

    // 获取并显示基站
    @Async(() => [])
    protected async tagAnchor() {
        const { pagedData: { datas } }: ResponseData<IBaseStation> = await this.$http.get(GET_BASE, {
            currentPage: 1,
            pageSize: 10000,
        });

        const data = datas.filter(v => this.groups.includes(v.groupId));
        this.mgr && data.forEach(this.createBase.bind(this));

        return data;
    }

    protected async addIcon(gid: number, info: IconParms, type: ICON_TYPE = ICON_TYPE.TAG) {
        if (!this.mgr) {
            return console.error('地图错误');
        }

        const map = this.mgr.map;
        if (this.mgr instanceof FengMapMgr) {
            (<fengmap.FMMap>map).gestureEnableController.enableMapHover = true;
        }

        const callback = (im: Sprite) => {
            im.custom = im.custom || {};
            Object.assign(im.custom, { type, info });
            info.callback && info.callback(im);
        };
        const options = {
            callback,
            x: info.x,
            y: info.y,
            height: 1,
            url: (await this.getIcon(info, type)) || info.icon,
            size: info.size || 48
        };

        return this.mgr.addImage(options, info.name, gid, !!info.isMapCoor);
    }

    /**
     * 绑定地图事件
     * @param data 地图数据
     */
    protected bindEvents(data: IMap) {
        //
    }
    /**
     * 在选择地图后初始化数据
     * @param data 地图数据
     */
    protected initData(data: IMap) {
        //
    }

    /**
     * 根据标签是否一组绘制连线
     * @param tagNo 标签编号
     * @param coords 坐标
     */
    protected link(tagNo: string, coords: Vector3) {
        //
    }

    /**
     * 释放内存
     */
    protected dispose() {
        //
    }

    protected showLine(tagNo: string) {
        return this.showPath;
    }

    private _dispose() {
        this.dispose();
        this.twinkleTimer.forEach(clearTimeout);
        this.twinkleTimer.clear();

        if (this.mgr) {
            this.mgr.dispose();
            this.mgr = undefined;
        }
    }

    private beforeMove(tagNo: string) {
        const timer = this.twinkleTimer.get(tagNo);
        if (timer) {
            clearTimeout(timer);
            this.twinkleTimer.delete(tagNo);
        }

        if (this.mgr) {
            this.mgr.show(tagNo, true);

            if (this.showLine(tagNo)) {
                this.mgr.addLine([], {
                    lineType: fengmap.FMLineType.FULL,
                    lineWidth: 2,
                    smooth: false
                }, tagNo);
            } else {
                this.mgr.lineMgr.remove(tagNo);
            }
        }
    }

    // 显示基站
    private createBase(v: IBaseStation) {
        // 添加基站图标
        this.addIcon(
            1,
            {
                x: v.coordx,
                y: v.coordy,
                name: v.id,
                groupid: v.groupId,
                icon: '/images/anchor.png',
                size: 32
            },
            ICON_TYPE.STATION
        );

        // 添加基站名
        this.mgr!.addTextMarker(
            {
                height: 0.8,
                fontsize: 15,
                type: 1,
                x: v.coordx,
                y: v.coordy - 40
            },
            v.id
        );
    }

    @Async()
    private async getIcon(info: IconParms, type: ICON_TYPE) {
        switch (type) {
            case ICON_TYPE.TAG: {
                await errorStore.getItem((<ITag>info).id);
                return ERROR_IMG;
            }
            case ICON_TYPE.STATION: {
                await errorStore.getItem((<BaseIconParams>info).name);
                return BASE_ERROR_IMG;
            }
            default: return info.icon;
        }
    }

    @Async(console.log)
    private async initMap(data: IMap) {
        if (!(data && this.container)) {
            return;
        }

        this.loading({ customClass: 'loading-mark' }); // 显示加载遮罩
        await loopAwait(() => !!(this.container && this.container.offsetWidth && this.container.offsetHeight));

        this._dispose();
        this.mgr = createMap(data, this.container);
        this.mgr!.on('loadComplete', this.loaded.bind(this)); // 加载完毕关闭遮罩
        this.bindEvents(data);

        return true;
    }
}

// ==================================================================================
enum ICON_TYPE {
    TAG = 1,
    STATION = 2
}

type Sprite = (fengmap.FMImageMarker | PIXI.Sprite) & { custom?: Record<string, any> };
interface BaseIconParams extends Vector2 {
    name: string;
    groupid: string;
    icon: string;
}
interface TagIconParams extends ITag, Vector3 {
    tagName: string;
}
interface CommonIconParams {
    size?: number;
    isMapCoor?: boolean;
    callback?(im: Sprite): void;
}

type IconParms = (BaseIconParams | TagIconParams) & CommonIconParams;
