import Vue from 'vue';
import Component from 'vue-class-component';
import { loopAwait } from '@/assets/utils/util';
import { createMap } from '@/assets/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import MapSelect from '@/components/MapSelect.vue';
import { PIXIMgr } from '@/assets/map/pixi';
import { Watch, Ref } from 'vue-property-decorator';

@Component({
    components: {
        'map-select': MapSelect,
    }
})
export default class MapMixin extends Vue {
    public mgr?: FengMapMgr | PIXIMgr;
    public showPath: boolean = false;
    public groups: string[] = []; // 当前地图关联组号

    @Ref('map') protected readonly canvas?: HTMLCanvasElement;
    protected renderTags?: { [x: string]: number } | Set<string>;

    public beforeDestroy() {
        this.dispose();
    }

    public async selectMap(data: IMap) {
        this.initData();

        if (data) {
            this.groups = <string[]>data.groupCode;
            if (this.canvas) {
                try {
                    await loopAwait(() => !!(this.canvas && this.canvas.offsetWidth && this.canvas.offsetHeight));
                    this.dispose();

                    this.mgr = createMap(data, this.canvas);
                    this.bindEvents(data);
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }

    @Watch('showPath')
    public createOrRemovePath() {
        if (!this.mgr || !this.renderTags) {
            return;
        }

        if (this.showPath) {
            const keys = this.renderTags instanceof Set ? this.renderTags : Object.keys(this.renderTags);
            keys.forEach((id: string) => {
                this.mgr!.addLine([], {
                    lineType: fengmap.FMLineType.FULL,
                    lineWidth: 2,
                    smooth: false
                }, id);
            });
        } else {
            this.mgr.lineMgr.remove();
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
}
