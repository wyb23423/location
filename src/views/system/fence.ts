
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';

import MapMixin from '@/mixins/map';
import { ElForm } from 'element-ui/types/form';

@Component
export default class Fence extends mixins(TableMixin, MapMixin) {
    public activeNames: string[] = ['info', 'add'];

    // ===================================table
    public colCfg: any[] = [
        { prop: 'name', label: '区域', sortable: true, width: 80 },
        { prop: 'status', label: '状态', width: 70 }
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
        return `calc(${100 / this.$store.state.rootScale}vh - 600px)`;
    }
    // ====================================
    private pointIndex: number = -1;

    /**
     * 删除区域
     */
    public async del(row: IZone, index: number) {
        try {
            await this.$confirm(`确认删除区域${row.name}?`, '确认删除');
            await this.$http.post('/api/zone/deleteZone', { id: row.id });

            this.$message.success('删除成功');

            this.refresh();
            this.display(row, index, true);
        } catch (e) {
            //
        }
    }
    /**
     * 切换区域显示
     */
    public display(row: IZone, index: number, isDel?: boolean) {
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

        const position = <TPosition>[...this.form.position];
        position.pop();

        const now = Date.now();
        const data: IZone = {
            id: 0,
            position,
            name: this.form.name,
            enable: this.form.open ? 1 : 0,
            createTime: now,
            updateime: now
        };
        this.mgr!.createPolygonMarker(position, data.name, true);

        setTimeout(() => {
            this.$confirm('请确定当前区域范围', '提示', { type: 'info' })
                .then(() => {
                    position.forEach(<any>this.setPosition, this);

                    data.position = JSON.stringify(position);
                    Reflect.deleteProperty(data, 'id');

                    return this.$http.post('/api/zone/addZone', data, { 'Content-Type': 'application/json' });
                })
                .then(() => {
                    this.$message.success('添加成功');
                    this.refresh(this.page);

                    (<ElForm>this.$refs.form).resetFields();
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
            data = res.pagedData.datas.map((v: IZone) => {
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

    protected bindEvents() {
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
