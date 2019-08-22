
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import MapMixin from '@/mixins/map';
import ZoneEidt from '@/components/ZoneEdit.vue';
import { State } from 'vuex-class';
import { ZoneMode } from '@/store';

@Component({
    components: {
        'zone-input': ZoneEidt
    }
})
export default class Fence extends mixins(TableMixin, MapMixin) {
    public activeNames: string[] = ['info', 'add'];
    public pointIndex: number = -1; // 设置区域顶点时的索引
    public zone: IZone | null = null; // 设置中的区域

    // ===================================table
    public colCfg: any[] = [
        { prop: 'name', label: '区域', sortable: true, width: 90 },
        { prop: 'status', label: '状态', width: 60 }
    ];
    public operation: any[] = [
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
        mode: 1,
        position: [null],
        open: true,
        baseNo2: '',
        baseNo1: ''
    };
    public get formHeight() {
        return `calc(${100 / this.$store.state.rootScale}vh - 500px)`;
    }
    // ====================================
    @State private readonly zoneMode!: ZoneMode;

    private isFirst: boolean = true; // 是否是第一次点击设置点

    public created() {
        if (this.permission.delete) {
            this.operation.push({ type: 'danger', name: 'del', desc: '删除' });
        }
        if (this.permission.put) {
            this.operation.push({ type: 'warning', name: 'setting', desc: '设置' });
        }
    }

    /**
     * 删除区域
     */
    public async del(row: IZone, index: number) {
        try {
            await this.$confirm(`确认删除区域${row.name}?`, '确认删除');
            await this.$http.post('/api/zone/deleteZone', { id: row.id });
        } catch (e) {
            return console.log(e);
        }

        this.$message.success('删除成功');
        this.refresh();
        this.display(row, index, true);
    }
    /**
     * 切换区域显示
     */
    public display(row: IZone, index: number, isDel?: boolean) {
        const i = this.operation.findIndex(v => v.name === 'display');
        if (i > -1) {
            const op = this.operation[i];
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

            this.$set(this.operation, i, op);
        }

    }

    public setPosition(point: Vector3, i: number) {
        const index = this.form.position.indexOf(point);

        if (point && index > -1) {
            // 删除已设置的顶点
            this.form.position.splice(index, 1);
            this.mgr && this.mgr.remove(JSON.stringify(point));
        } else {
            // 进入设置区域顶点模式
            this.pointIndex = i;
            if (this.isFirst) {
                this.$message.info('点击地图设置区域顶点');
                this.isFirst = false;
            }
        }
    }

    // 添加区域
    public onSubmit() {
        if (!this.form.name) {
            return this.$message.error('区域名称不能为空');
        }

        // position数组最后一项始终为用于占位的null
        const pointsCount = this.form.position.length - 1;
        if (pointsCount < 3) {
            return this.$message.warning('区域坐标最少设置3个');
        }

        if (this.form.mode === this.zoneMode.switch && pointsCount !== 4) {
            return this.$message.warning('切换区域坐标必须为4个');
        }

        const position = <TPosition>[...this.form.position];
        position.pop();
        this.mgr && this.mgr.createPolygonMarker(position, this.form.name, true);
        setTimeout(() => this.put(position), 1000);
    }

    // 更新区域数据
    public update() {
        if (this.zone) {
            if (!this.zone.name) {
                return this.$message.error('区域名称不能为空');
            }

            const data: IZone = {
                ...this.zone,
                position: JSON.stringify(this.zone.position),
                updateTime: Date.now(),
                enable: this.zone.open ? 1 : 0
            };

            this.$http.post('/api/zone/updateZone', data, { 'Content-Type': 'application/json' })
                .then(() => {
                    this.$message.success('修改区域信息成功');
                    this.refresh();
                })
                .catch(console.log);
        }
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
                v.open = !!v.enable;
                v.mode = v.mode == null ? 0 : v.mode;

                return v;
            });

            count = res.pagedData.totalCount;
        } catch (e) {
            console.log(e);
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

    // 确认并添加区域
    private put(position: TPosition) {
        this.$confirm('请确定当前区域范围', '提示', { type: 'info' })
            .then(() => this.submitAddZone(position))
            .then(() => {
                position.forEach(<any>this.setPosition, this); // 移除设置的顶点
                this.form.name = '';
                this.form.mode = 1;

                this.$message.success('添加成功');
                this.refresh(this.page);
            })
            .catch(console.log)
            .finally(() => this.mgr && this.mgr.remove(this.form.name));
    }

    // 组织并提交数据(添加数据)
    private submitAddZone(position: TPosition): Promise<ResponseData> {
        const now = Date.now();
        if (!this.mgr) {
            this.$message.error('地图不存在, 提交失败!');
            return Promise.reject('地图不存在');
        }

        const data: IZone = Object.assign({}, this.form, {
            position: JSON.stringify(position.map(v => this.mgr!.getCoordinate(v))),
            enable: this.form.open ? 1 : 0,
            createTime: now,
            updateTime: now
        });

        return this.$http.post('/api/zone/addZone', data, { 'Content-Type': 'application/json' });
    }
}
