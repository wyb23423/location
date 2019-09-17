/**
 * 绘制绑定为一组的标签间的线
 */
import Vue from 'vue';
import Component from 'vue-class-component';
import { FengMapMgr } from '@/assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';
import { NOTIFY_KEY, MISS_MSG } from '@/constant';

@Component
export default class Link extends Vue {
    public mgr?: FengMapMgr | PIXIMgr;

    private bindings = new Map<string, number[]>();
    private points = new Map<number, Record<string, Vector3>>(); // 记录的坐标点

    private missHandler?: (data: IAlarm) => void;

    public created() {
        // TODO 从服务器获取数据
        const testData = [
            {
                id: 0,
                tags: []
            },
            {
                id: 1,
                tags: []
            }
        ];
        this.normalize(testData);

        // 绑定信号丢失时移除关联线的处理函数
        this.missHandler = (data: IAlarm) => {
            if (data.alarmMsg === MISS_MSG) {
                this.link(data.tagNo);
            }
        };
        this.$event.on(NOTIFY_KEY, this.missHandler);
    }

    public destroyed() {
        this.missHandler && this.$event.off(NOTIFY_KEY, this.missHandler);
    }

    protected link(tagNo: string, coords?: Vector3) {
        const points = this.getAngRecordPoints(tagNo, coords);

        points.forEach(v => {
            if (this.mgr) {
                for (const [k, p] of Object.entries(v)) {
                    const name = 'link_' + k;
                    this.mgr.lineMgr.remove(name);

                    if (p.length < 2) {
                        continue;
                    }

                    if (p.length > 2) {
                        p.push(p[0]);
                    }

                    this.mgr.addLine(
                        p,
                        {
                            lineType: fengmap.FMLineType.FULL,
                            lineWidth: 2,
                            smooth: false,
                            color: '#e00',
                            colorNum: 0xee0000
                        },
                        name
                    );
                }
            }
        });
    }

    private getAngRecordPoints(tagNo: string, coords?: Vector3) {
        const bindings = this.bindings.get(tagNo);

        if (!bindings) {
            return [];
        }

        return bindings.map(flag => {
            const points = this.points.get(flag) || {};
            coords ? (points[tagNo] = coords) : Reflect.deleteProperty(points, tagNo);
            this.points.set(flag, points);

            return { [flag]: Object.values(points) };
        });
    }

    private normalize(datas: IBangdings[]) {
        datas.forEach(v => {
            const tags: string[] = Array.isArray(v.tags) ? v.tags : JSON.parse(v.tags);

            tags.forEach(tagNo => {
                const tmp = this.bindings.get(tagNo) || [];
                tmp.push(v.id);
                this.bindings.set(tagNo, tmp);
            });
        });
    }
}
