
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import ZoneEidt from '@/components/edit/ZoneEdit.vue';
import { State } from 'vuex-class';
import { ZoneMode } from '@/store';
import ZoneMixin from '@/mixins/zone';

@Component({
    components: {
        'zone-input': ZoneEidt
    }
})
export default class Zone extends mixins(TableMixin, ZoneMixin) {
    public activeNames: string[] = ['info', 'add'];
    public zone: ZoneData | null = null; // 设置中的区域

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
        mode: 2,
        open: true
    };
    // ====================================
    @State private readonly zoneMode!: ZoneMode;

    public created() {
        if (this.permission.delete) {
            this.operation.push({ type: 'danger', name: 'del', desc: '删除' });
        }
        if (this.permission.put) {
            this.operation.push({ type: 'warning', name: 'setting', desc: '设置' });
        }

        this.form.mode = this.zoneMode.in;
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

        this.refresh()
            .display(row, index, true)
            .$message.success('删除成功');
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

        return this;
    }

    // 添加区域
    public onSubmit() {
        if (!this.form.name) {
            return this.$message.error('区域名称不能为空');
        }

        const pointsCount = this.points.length;
        if (pointsCount < 3) {
            return this.$message.warning('区域坐标最少设置3个');
        }

        if (this.form.mode === this.zoneMode.switch && pointsCount !== 4) {
            return this.$message.warning('切换区域坐标必须为4个');
        }

        this.put();
    }

    // 更新区域数据
    public async update() {
        if (this.zone) {
            if (!this.zone.name) {
                return this.$message.error('区域名称不能为空');
            }

            if (this.zone.mode === this.zoneMode.switch) {
                const pointsCount = this.zone.position.length;
                if (pointsCount < 4) {
                    return this.$message.warning('此区域坐标数少于4, 不能设置为切换区域');
                }

                if (pointsCount > 4) {
                    try {
                        await this.$confirm(`此区域坐标数为${pointsCount}, 将删除最后的${pointsCount - 4}个坐标点`);
                        this.zone.position = <TPosition>this.zone.position.slice(0, 4);
                    } catch (e) {
                        return;
                    }
                }
            }

            const data: IZone = {
                ...this.zone,
                position: JSON.stringify(this.zone.position),
                enable: this.zone.open ? 1 : 0
            };

            this.$http
                .post('/api/zone/updateZone', data, { 'Content-Type': 'application/json' })
                .then(() => this.refresh().$message.success('修改区域信息成功'))
                .catch(console.log);
        }
    }

    protected initData() {
        this.getData(1, 10);
    }

    protected async fetch(page: number, pageSize: number) {
        if (this.mapId == null) {
            return { count: 0, data: [] };
        }

        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get('/api/zone/getall', {
                pageSize,
                currentPage: page,
                mapId: this.mapId
            });
            data = res.pagedData.datas.map((v: ZoneData) => {
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

    // 确认并添加区域
    private put() {
        this.$confirm('请确定当前区域范围', '提示', { type: 'info' })
            .then(this.submitAddZone.bind(this))
            .then(() =>
                this.remove()
                    .resetForm()
                    .refresh()
                    .$message.success('添加成功')
            )
            .catch(console.log);
    }

    // 组织并提交数据(添加数据)
    private submitAddZone(): Promise<ResponseData> {
        const now = Date.now();
        if (!this.mgr) {
            this.$message.error('地图不存在, 提交失败!');
            return Promise.reject('地图不存在');
        }

        const data: IZone = Object.assign({}, this.form, {
            position: JSON.stringify(this.points.map(v => this.mgr!.getCoordinate(v))),
            enable: this.form.open ? 1 : 0,
            createTime: now,
            updateTime: now,
            mapId: this.mapId
        });

        return this.$http.post('/api/zone/addZone', data, { 'Content-Type': 'application/json' });
    }

    /**
     * 重置表单数据
     */
    private resetForm() {
        this.form = {
            name: '',
            mode: this.zoneMode.in,
            open: true
        };

        return this;
    }
}

type ZoneData = IZone & { open: boolean; status: '开启' | '关闭' };
