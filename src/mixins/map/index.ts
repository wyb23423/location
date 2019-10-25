import Vue from 'vue';
import Component from 'vue-class-component';
import { loopAwait, Async } from '@/assets/utils/util';
import { createMap } from '@/assets/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import MapSelect from '@/components/MapSelect.vue';
import { PIXIMgr } from '@/assets/map/pixi';
import { Ref } from 'vue-property-decorator';
import { ElLoadingComponent } from 'element-ui/types/loading';
import { errorStore } from '@/components/Notice.vue';
import { ERROR_IMG } from '@/constant';

@Component({
    components: {
        'map-select': MapSelect,
    }
})
export default class MapMixin extends Vue {
    public mgr?: FengMapMgr | PIXIMgr;
    public showPath: boolean = false;
    public groups: string[] = []; // 当前地图关联组号
    public mapId?: number;

    @Ref('map') protected readonly container?: HTMLElement;
    protected readonly ICON_TYPE = ICON_TYPE;

    private mark?: ElLoadingComponent;

    public beforeDestroy() {
        this.dispose();

        // 关闭遮罩
        this.mark && this.mark.close();
        this.mark = undefined;
    }

    public async selectMap(data: IMap) {
        if (data) {
            this.groups = <string[]>data.groupCode;
            this.mapId = data.id;
        }
        this.initData();

        if (data && this.container) {
            this.mark = this.$loading({ customClass: 'loading-mark' }); // 开启加载中的遮罩

            try {
                await loopAwait(() => !!(
                    this.container && this.container.offsetWidth && this.container.offsetHeight
                ));

                this.dispose();

                this.mgr = createMap(data, this.container);
                // 加载完毕关闭遮罩
                this.mgr!.on('loadComplete', () => {
                    this.mark && this.mark.close();
                    this.mark = undefined;
                });
                this.bindEvents(data);
            } catch (e) {
                console.warn(e);

                // 出错关闭遮罩
                this.mark && this.mark.close();
                this.mark = undefined;
            }
        }
    }

    protected bindEvents(data?: IMap) {
        // 绑定地图数据
    }
    protected initData() {
        // 在选择地图后初始化数据
    }

    protected dispose() {
        if (this.mgr) {
            this.mgr.dispose();
            this.mgr = undefined;
        }
    }

    protected moveTo(tagNo: string, coord: Vector3, time: number, update?: () => void) {
        if (this.mgr) {
            this.mgr.show(tagNo, true);

            if (this.showPath) {
                this.mgr.addLine([], {
                    lineType: fengmap.FMLineType.FULL,
                    lineWidth: 2,
                    smooth: false
                }, tagNo);
            } else {
                this.mgr.lineMgr.remove(tagNo);
            }
        }

        return new Promise(resolve => {
            if (this.mgr) {
                const points: Vector3[] = [];
                this.mgr.moveTo(
                    tagNo, coord, time,
                    (v: Vector2) => {
                        update && update();

                        points.push({ x: v.x, y: v.y, z: 1 });
                        if (this.mgr && points.length >= 10) {
                            this.mgr.appendLine(tagNo, points, true);
                            this.link(tagNo, <Vector3>points.pop());
                            points.length = 0;
                        }
                    },
                    resolve
                );
            } else {
                resolve();
            }
        });
    }

    // 获取并显示基站
    @Async(() => [])
    protected async tagAnchor() {
        const res = await this.$http.get('/api/base/getall', {
            currentPage: 1,
            pageSize: 10000,
        });

        const data: IBaseStation[] = res.pagedData.datas;
        this.createBases(data);

        return data;
    }

    protected async addIcon(gid: number, info: IconParms, type: ICON_TYPE = ICON_TYPE.TAG) {
        if (this.mgr) {
            const map = this.mgr.map;
            if (this.mgr instanceof FengMapMgr) {
                (<fengmap.FMMap>map).gestureEnableController.enableMapHover = true;
            }

            return this.mgr.addImage(
                {
                    x: info.x,
                    y: info.y,
                    height: 1,
                    url: await this.getIcon(info, type),
                    size: info.size || 48,
                    callback: (im: Sprite) => {
                        if (!im.custom) {
                            im.custom = {};
                        }

                        Object.assign(im.custom, { type, info });

                        if (info.callback) {
                            info.callback(im);
                        }
                    }
                },
                info.name, gid,
                !!info.isMapCoor
            );
        }
    }

    // 根据标签是否一组绘制连线
    protected link(tagNo: string, coords: Vector3) {
        //
    }

    // 显示基站
    private createBases(data: IBaseStation[]) {
        if (this.mgr) {
            for (const v of data) {
                // 添加基站图标
                this.addIcon(
                    1,
                    {
                        x: v.coordx,
                        y: v.coordy,
                        name: v.id,
                        groupid: v.groupCode,
                        icon: '/images/anchor.png',
                        size: 32
                    },
                    ICON_TYPE.STATION
                );

                // 添加基站名
                this.mgr.addTextMarker(
                    {
                        height: 2,
                        fontsize: 15,
                        type: 1,
                        x: v.coordx,
                        y: v.coordy - 40
                    },
                    v.id
                );
            }
        }
    }

    private async getIcon(info: IconParms, type: ICON_TYPE) {
        switch (type) {
            case ICON_TYPE.TAG: {
                try {
                    await errorStore.getItem((<ITag>info).id);

                    return ERROR_IMG;
                } catch (e) {
                    //
                }
            }
            default: return info.icon;
        }
    }
}

enum ICON_TYPE {
    TAG = 1,
    STATION = 2
}

type Sprite = (fengmap.FMImageMarker | PIXI.Sprite) & { custom?: Record<string, any> };
interface BaseIconParams extends Vector2 {
    name: string;
    groupid: string;
    icon: string;
    size?: number;
}
interface TagIconParams extends ITag, Vector3 {
    tagName: string;
}
interface CommonIconParams {
    isMapCoor?: boolean;
    callback?(im: Sprite): void;
}

type IconParms = (BaseIconParams | TagIconParams) & CommonIconParams;
