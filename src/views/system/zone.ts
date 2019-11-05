
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import ZoneEidt from '@/components/edit/ZoneEdit.vue';
import { Setting, ZoneData } from '@/mixins/zone/setting';
import { Async } from '@/assets/utils/util';

@Component({
    components: {
        'zone-input': ZoneEidt
    }
})
export default class Zone extends mixins(Setting, TableMixin) {
    public activeNames: string[] = ['info', 'add'];

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
    @Async()
    public async del(row: IZone, index: number) {
        await this.$confirm(`确认删除区域${row.name}?`, '确认删除');
        await this.$http.post('/api/zone/deleteZone', { id: row.id });
        this.refresh().display(row, index, true).$message.success('删除成功');
    }
    /**
     * 切换区域显示
     */
    public display(row: IZone, index: number, isDel?: boolean) {
        const i = this.operation.findIndex(v => v.name === 'display');
        if (i > -1) {
            const op = this.operation[i];
            if (op.type[row.id] || isDel) {
                op.type[row.id] = undefined;

                if (this.mgr) {
                    this.mgr.remove(row.name);
                }
            } else {
                op.type[row.id] = 'success';

                if (this.mgr) {
                    this.mgr.zoneOpen(row);
                }
            }
            op.desc[row.id] = op.desc[row.id] || isDel ? undefined : '隐藏';

            this.$set(this.operation, i, op);
        }

        return this;
    }

    // 确认并添加区域
    @Async()
    public async put() {
        if (this.isVaild(this.form.name, this.form.mode) !== true) {
            return;
        }

        await this.$confirm('请确定当前区域范围', '提示', { type: 'info' });
        const data = this.assignZone(this.form);
        if (!data) {
            return;
        }
        await this.$http
            .post('/api/zone/addZone', data, { 'Content-Type': 'application/json' });

        this.remove().resetForm().refresh(false).$message.success('添加成功');
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
                const position: { coordinates: VectorAxis[] } = JSON.parse(<string>v.position);
                v.position = position.coordinates;
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


