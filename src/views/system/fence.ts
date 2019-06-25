
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';

import { ZoneData } from '../../assets/map/map';
import * as http from '../../assets/utils/http';
import SelectMapMixin from '@/mixins/selectMap';

@Component
export default class Fence extends mixins(TableMixin, SelectMapMixin) {
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
    private pointIndex: number = -1;

    /**
     * 删除区域
     */
    public async del(row: ZoneData, index: number) {
        try {
            await this.$confirm(`确认删除区域${row.name}?`, '确认删除');
            await this.$http.post('/api/zone/deleteZone', { id: row.id });

            this.$message.success('删除成功');

            this.tableData.splice(index, 1);
            this.display(row, index, true);
        } catch (e) {
            //
        }
    }
    /**
     * 切换区域显示
     */
    public display(row: ZoneData, index: number, isDel?: boolean) {
        const op: any = this.op[1];
        if (op.type[index] || isDel) {
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
        op.desc[index] = op.desc[index] || isDel ? undefined : '隐藏';

        this.$set(this.op, 1, op);
    }

    public setPosition(point: Vector3, i: number) {
        const index = this.form.position.indexOf(point);

        if (point && index > -1) {
            this.form.position.splice(index, 1);
            this.mgr!.remove(JSON.stringify(point));
        } else {
            this.pointIndex = i;
        }
    }
    public onSubmit() {
        if (!this.form.name.length) {
            return this.$message.warning('区域名称必填');
        }

        if (this.form.position.length < 4) {
            return this.$message.warning('区域坐标最少设置3个');
        }

        const position: Vector2[] = [...this.form.position];
        position.pop();

        const data: ZoneData = {
            position,
            name: this.form.name,
            enable: this.form.open ? 1 : 0
        };
        this.mgr!.createPolygonMaker(position, data.name, true);

        setTimeout(() => {
            this.$confirm('请确定当前区域范围', '提示', { type: 'info' })
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
        }, 1000);
    }

    /**
     * 获取表格数据
     */
    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get('/api/zone/getall', {
                pageSize,
                currentPage: page
            });
            data = res.pagedData.datas.map((v: ZoneData) => {
                v.status = v.enable ? '开启' : '关闭';
                v.position = JSON.parse(<string>v.position);

                return v;
            });

            count = res.pagedData.totalCount;
        } catch (e) {
            //
        }

        return { count, data };
    }

    protected bindClickEvent() {
        this.mgr!.on('mapClickNode', (event: FMMapClickEvent) => {
            if (event.nodeType === fengmap.FMNodeType.NONE) {
                return;
            }

            if (this.pointIndex > -1) {
                // 获取坐标信息
                const eventInfo = event.eventInfo.coord;

                const p = this.mgr!.addImage({
                    x: eventInfo.x,
                    y: eventInfo.y,
                    url: '/images/blueImageMarker.png',
                    size: 32,
                    height: 2
                });

                this.$set(this.form.position, this.pointIndex, p);

                this.pointIndex = -1;
                this.form.position.push(null);
            }
        });
    }
}
