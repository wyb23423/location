/**
 * 绘制绑定为一组的标签间的线
 */
import Vue from 'vue';
import Component from 'vue-class-component';
import { FengMapMgr } from '@/assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';
import { MISS } from '@/constant';
import EventMixin from '../event';
import { Async } from '@/assets/utils/util';
import { GET_BIND } from '@/constant/request';

@Component
export default class Link extends EventMixin {
    public mgr?: FengMapMgr | PIXIMgr;

    private bindings = new Map<string, Set<number>>(); // 用于记录标签属于哪些绑定组 <标签号, 绑定组号>
    private points = new Map<number, Record<string, Vector3>>(); // 记录的坐标点 <绑定组号, 各标签坐标>

    public created() {
        this.initLinkData();
        // 绑定信号丢失时移除关联线的处理函数
        this.on(MISS, this.link.bind(this));
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

                    // 大于两个点, 将第一个点加入数组最后形成闭环
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
                        name,
                        true
                    );
                }
            }
        });
    }

    @Async()
    private async initLinkData() {
        const { pagedData: { datas } }: ResponseData<IBingdings> = await this.$http.get(GET_BIND);
        this.normalize(datas);
    }

    private getAngRecordPoints(tagNo: string, coords?: Vector3) {
        const bindings = this.bindings.get(tagNo);

        if (!bindings) {
            return [];
        }

        const result: Array<Record<number, Vector3[]>> = [];
        bindings.forEach(flag => {
            const points = this.points.get(flag) || {};
            coords ? (points[tagNo] = coords) : Reflect.deleteProperty(points, tagNo);
            this.points.set(flag, points);

            result.push({ [flag]: Object.values(points) });
        });

        return result;
    }

    private normalize(datas: IBingdings[]) {
        datas.forEach(v => {
            const tags: string[] = v.bundle.map(t => t.id);
            tags.push(v.main.id);

            tags.forEach(tagNo => {
                const tmp = this.bindings.get(tagNo) || new Set();
                tmp.add(v.id);
                this.bindings.set(tagNo, tmp);
            });
        });
    }
}
