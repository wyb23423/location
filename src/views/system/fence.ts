
import Component, { mixins } from 'vue-class-component';
import MapSelect from '../../components/MapSelect.vue';
import { createMap } from '../../assets/map';
import { loopAwait } from '../../assets/utils/util';
import TableMixin from '../../mixins/table';

import Table from '../../components/Table.vue';

import { FengMapMgr } from '../../assets/map/fengmap';
import { ZoneData, MapData } from '../../assets/map/map';
import { Message, MessageBox } from 'element-ui';

@Component({
    components: {
        'map-select': MapSelect,
        'app-table': Table
    }
})
export default class Fence extends mixins(TableMixin) {
    public mgr?: FengMapMgr;
    public activeNames: string[] = ['info', 'add'];

    // ===================================table
    public colCfg: any[] = [
        { prop: 'name', label: '区域', sortable: true, width: 100 },
        { prop: 'status', label: '状态', width: 80 }
    ];
    public op: any[] = [
        { type: 'danger', name: 'del', desc: '删除' },
        {
            type: { default: 'primary' },
            name: 'display',
            desc: { default: '显示' }
        }
    ];
    // =====================================

    // =======================form
    public form: any = {
        name: '',
        mode: 0,
        position: [null],
        open: false
    };
    public get formHeight() {
        return `calc(${100 / this.$store.state.rootScale}vh - 560px)`;
    }
    // ====================================

    private pointIndex: number = -1; // 坐标点索引

    /**
     * 删除区域
     */
    public del(row: ZoneData) {
        console.log(row);
    }
    /**
     * 切换区域显示
     */
    public display(row: ZoneData, index: number) {
        const op: any = this.op[1];
        if (op.type[index]) {
            op.type[index] = undefined;

            if (this.mgr) {
                this.mgr.remove(row.name);
            }
        } else {
            op.type[index] = 'success';

            if (this.mgr) {
                this.mgr.zoneOpen(row);
            }
        }
        op.desc[index] = op.desc[index] ? undefined : '隐藏';

        this.$set(this.op, 1, op);
    }

    /**
     * 选择地图显示
     */
    public async selectMap(data: MapData) {
        if (data) {
            const dom = <HTMLElement>this.$refs.map;
            await loopAwait(() => !!dom.offsetWidth && !!dom.offsetHeight);
            this.mgr = createMap(data, dom);

            this.bindClickEvent();
        }
    }

    public setPosition(index: number) {
        if (this.form.position[index]) {
            this.form.position.splice(index, 1);
            this.mgr!.remove(index);
            this.pointIndex = -1;
        } else {
            this.pointIndex = index;
        }
    }
    public onSubmit() {
        if (!this.form.name.length) {
            return Message.warning('区域名称必填');
        }

        if (this.form.position.length < 4) {
            return Message.warning('区域坐标最少设置3个');
        }

        const position: Vector2[] = [...this.form.position];
        position.pop();

        const data: ZoneData = {
            position,
            name: this.form.name,
            enable: this.form.open ? 1 : 0
        };
        this.mgr!.createPolygonMaker(position, data.name, true);

        MessageBox.confirm('请确定当前区域范围', '提示', { type: 'info' })
            .then(() => {
                position.forEach((v, i) => {
                    this.mgr!.remove(i);
                });

                this.form = {
                    name: '',
                    mode: 0,
                    position: [null],
                    open: false
                };
                data.position = JSON.stringify(position);

                console.log(data);
            })
            .catch(console.log)
            .finally(() => {
                this.mgr!.remove(data.name);
            });
    }

    /**
     * 获取表格数据
     */
    public async _getData(page: number, pageSize: number) {
        // TODO: 换为请求
        // 模拟数据
        return {
            count: 40,
            data: [
                {
                    status: '开启',
                    id: 26,
                    name: '全部区域',
                    position: [
                        { x: -0.9095089685816896, y: 1849.9453632454365 },
                        { x: -38.21209882974026, y: 104.85372044282641 },
                        { x: 2413.5853957760114, y: 78.69602985429896 },
                        { x: 2396.6296731272414, y: 1763.998665644061 },
                        { x: 2227.0724466395422, y: 1861.155802069091 }
                    ]
                },
                {
                    status: '关闭',
                    id: 25,
                    name: 'C',
                    position: [
                        { x: 710.5247554581757, y: 1809.3815817503148 },
                        { x: 693.6882925245968, y: 792.5563051437117 },
                        { x: 1437.8599577445877, y: 766.5790170557325 },
                        { x: 1471.5328837810696, y: 1842.7809521424817 }
                    ]
                }
            ]
        };
    }

    private bindClickEvent() {
        this.mgr!.on('mapClickNode', (event: FMMapClickEvent) => {
            if (event.nodeType === fengmap.FMNodeType.NONE) {
                return;
            }

            if (this.pointIndex > -1) {
                // 获取坐标信息
                const eventInfo = event.eventInfo.coord;

                const p = this.mgr!.addImage(
                    {
                        x: eventInfo.x,
                        y: eventInfo.y,
                        url: '/images/blueImageMarker.png',
                        size: 32,
                        height: 2
                    },
                    this.pointIndex
                );

                this.$set(this.form.position, this.pointIndex, p);

                this.pointIndex = -1;
                this.form.position.push(null);
            }
        });
    }
}
