import Vue from 'vue';
import Component from 'vue-class-component';
import { loopAwait } from '@/assets/utils/util';
import { createMap } from '@/assets/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import MapSelect from '@/components/MapSelect.vue';
import { PIXIMgr } from '@/assets/map/pixi';
import { Watch } from 'vue-property-decorator';

@Component({
    components: {
        'map-select': MapSelect,
    }
})
export default class MapMixin extends Vue {
    public mgr?: FengMapMgr | PIXIMgr;
    public showPath: boolean = false;
    public groups: string[] = []; // 当前地图关联组号

    protected renderTags?: { [x: string]: number } | Set<string>;

    private hasDeal: boolean = false;

    public beforeDestroy() {
        this.dispose();
    }

    public async selectMap(data: IMap) {
        if (data) {
            this.groups = <string[]>data.groupCode;
            const dom = <HTMLElement>this.$refs.map;
            if (dom) {
                try {
                    await loopAwait(() => !!dom.offsetWidth && !!dom.offsetHeight);
                    this.dispose();

                    this.mgr = createMap(data, dom);
                    this.bindEvents(data);
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }

    @Watch('showPath')
    public createOrRemovePath() {
        if (!this.mgr || !this.renderTags || this.hasDeal) {
            return this.hasDeal = false;
        }
        this.hasDeal = true;

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
        //
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
