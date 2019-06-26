import Component, { mixins } from 'vue-class-component';
import MapMixin from '@/mixins/map';
import { arr2obj } from '@/assets/utils/util';
import { BASE_URL, LOSS_TIME } from '@/config';

@Component
export default class Monitor extends mixins(MapMixin) {
    public info: ITag | null = null; // 显示信息的标签
    public infoPosition: Vector2 = { x: 0, y: 0 }; // 信息位置
    public group: { [x: string]: IBaseStation[] } = {}; // 基站分组

    private baseAll: IBaseStation[] = [];
    private tagAll: { [x: string]: ITag } = {};
    private zoneAll: IZone[] = [];
    private ws: WebSocket[] = [];
    private renderTags: { [x: string]: number } = {}; // 已经在地图上的标签,{tagNo: timer}

    public created() {
        Promise.all(['tag', 'zone'].map(async v => {
            try {
                const res = await this.$http.get(`/api/${v}/getall`, {
                    currentPage: 1,
                    pageSize: 1_0000_0000
                });

                return res.pagedData.datas;
            } catch (e) {
                return [];
            }
        }))
            .then(res => {
                this.zoneAll = res[1];
                this.tagAll = arr2obj(res[0], 'tagNo', false);
            });

        (<any>window).map = this;
    }

    public beforeDestroy() {
        let ws = this.ws.pop();
        while (ws) {
            ws.close();
            ws.onmessage = null;
            ws = this.ws.pop();
        }

        Object.values(this.renderTags).forEach(clearTimeout);
    }

    protected bindEvents() {
        this.mgr!.on('loadComplete', () => {
            this.tagAnchor().then(data => {
                this.baseAll = data;
                this.group = arr2obj(data, 'groupCode');
                this.initWebSoket();
            });
        });
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

    private initWebSoket() {
        const time = Date.now();

        let ip: string = location.host;
        if (process.env.NODE_ENV !== 'production') {
            const res = BASE_URL.match(/^http:\/\/([\d\.]+)\/$/);
            if (res) {
                ip = res[1];
            }
        }

        this.ws = Object.keys(this.group).map(k => {
            const ws = new WebSocket(`ws://${ip}:80/realtime/position/${k}/${time}`);
            ws.onmessage = (event: MessageEvent) => {
                const data: ITagInfo = JSON.parse(event.data);
                if (this.tagAll[data.sTagNo]) {
                    this.move(data);
                }
            };

            return ws;
        });
    }

    private move(tag: ITagInfo) {
        if (!this.mgr) {
            return console.log('获取地图失败!!');
        }

        if (tag.position.every(v => +v >= 0)) {
            const timer = this.renderTags[tag.sTagNo];
            const coord: Vector2 = {
                x: +tag.position[0],
                y: +tag.position[1]
            };

            if (timer) {
                clearTimeout(timer);

                this.mgr.moveTo(tag.sTagNo, coord, undefined, (v: Vector2) => {
                    // console.log(v);
                });
            } else {
                const info = {
                    ...this.tagAll[tag.sTagNo],
                    name: tag.sTagNo,
                    callback(im: any) {
                        if (im.alwaysShow) {
                            im.alwaysShow();
                        }
                    }
                };

                this.addIcon(this.mgr.map.groupIDs[0], coord, info);
            }

            this.renderTags[tag.sTagNo] = setTimeout(() => {
                console.log(`${tag.sTagNo}丢失`);

                delete this.renderTags[tag.sTagNo];
                if (this.mgr) {
                    this.mgr.remove(tag.sTagNo);
                }
            }, LOSS_TIME);
        }
    }
}


interface ITagInfo {
    sGroupNo: string;
    iBbattery: number;
    alarm: string;
    iHeartRate: number;
    position: string[];
    sTagNo: string;
}
