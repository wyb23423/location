import Component, { mixins } from 'vue-class-component';
import MapMixin from '@/mixins/map';

@Component
export default class Fence extends mixins(MapMixin) {
    private bases: IBaseStation[] = [];

    protected bindEvents() {
        this.mgr!.on('loadComplete', async () => {
            this.bases = await this.tagAnchor();
        });
    }

    private addIcon(gid: number, coord: Vector2, info: any, type: number = 1) {
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

    // 获取并显示基站
    private async tagAnchor() {
        try {
            const res = await this.$http.get('/api/base/getall', {
                currentPage: 1,
                pageSize: 10000
            });

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

                    this.mgr.addTextMarker(
                        {
                            z: 50,
                            height: 2,
                            fillcolor: '#009688',
                            fontsize: 15,
                            type: 1,
                            strokecolor: '255,255,0',
                            x: v.coordx,
                            y: v.coordy - 40
                        },
                        v.baseNo + ''
                    );
                }
            }

            return data;
        } catch (e) {
            return [];
        }
    }
}
