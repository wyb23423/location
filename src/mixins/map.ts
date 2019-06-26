import Vue from 'vue';
import Component from 'vue-class-component';
import { loopAwait } from '@/assets/utils/util';
import { createMap, MapData } from '@/assets/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import MapSelect from '@/components/MapSelect.vue';
import { TimeSelect } from 'element-ui';

@Component({
    components: {
        'map-select': MapSelect,
    }
})
export default class MapMixin extends Vue {
    public mgr?: FengMapMgr;

    public destroyed() {
        this.dispose();
    }

    public async selectMap(data: MapData) {
        if (data) {
            const dom = <HTMLElement>this.$refs.map;
            if (dom) {
                try {
                    await loopAwait(() => !!dom.offsetWidth && !!dom.offsetHeight);

                    this.dispose();

                    this.mgr = createMap(data, dom);
                    this.bindEvents();
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }

    protected bindEvents() {
        //
    }

    protected dispose() {
        if (this.mgr) {
            this.mgr.dispose();
            this.mgr = undefined;
        }
    }

    protected addIcon(gid: number, coord: Vector2, info: any, type: number = 1) {
        if (this.mgr) {
            const map = this.mgr.map;
            if (Reflect.has(map, 'gestureEnableController')) {
                map.gestureEnableController.enableMapHover = true;
            }

            return this.mgr.addImage(
                {
                    x: coord.x,
                    y: coord.y,
                    height: 0.5,
                    url: info.photo,
                    size: info.size || 48,
                    callback: (im: fengmap.FMImageMarker) => {
                        Object.assign(im.custom, { type, info });
                    }
                },
                info.name, gid,
                !!info.isMapCoor
            );
        }
    }

    protected tagAnchor() {
        return this.$http.get('/api/base/getall', {
            currentPage: 1,
            pageSize: 10000
        }).then((res: ResponseData) => {
            const data = res.pagedData.datas;

            if (this.mgr) {
                for (const v of data) {
                    this.addIcon(
                        1,
                        {
                            x: v.coordx,
                            y: v.coordy
                        },
                        {
                            name: v.baseNo,
                            groupid: v.groupCode,
                            photo: '/images/anchor.png',
                            size: 32
                        },
                        2
                    );

                    this.mgr.addTextMarker({
                        z: 50,
                        height: 2,
                        fillcolor: '#009688',
                        fontsize: 15,
                        type: 1,
                        strokecolor: '255,255,0',
                        x: v.coordx,
                        y: v.coordy - 40
                    }, v.baseNo + '');
                }
            }

            return data;
        });
    }
}
