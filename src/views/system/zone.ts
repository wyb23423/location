
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import ZoneEidt from '@/components/edit/ZoneEdit.vue';
import { Setting, ZoneData } from '@/mixins/zone/setting';
import { Async } from '@/assets/utils/util';
import DisplayMixin from '@/mixins/zone/display';
import { RM_ZONE, ADD_ZONE, GET_ZONE } from '@/constant/request';

@Component({
    components: {
        'zone-input': ZoneEidt
    }
})
export default class Zone extends mixins(Setting, TableMixin, DisplayMixin) {
    public activeNames: string = 'add';
    public colCfg: any[] = [
        { prop: 'name', label: '区域', sortable: true, width: 90 },
        { prop: 'status', label: '状态', width: 60 }
    ];
    public form: any = {
        name: '',
        mode: 1,
        open: true
    };
    // ====================================

    public created() {
        if (this.permission.delete) {
            this.operation.push({ type: 'danger', name: 'del', desc: '删除' });
        }
        if (this.permission.post) {
            this.operation.push({ type: 'warning', name: 'setting', desc: '设置' });
        }

        this.form.mode = this.zoneMode.fence;
    }

    /**
     * 删除区域
     */
    @Async()
    public async del(row: IZone, index: number) {
        await this.$confirm(`确认删除区域${row.name}?`, '确认删除');
        await this.$http.post(RM_ZONE, { id: row.id });
        this.refresh().display(row, index, true).$message.success('删除成功');
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
            .post(ADD_ZONE, data, { 'Content-Type': 'application/json' });

        this.removeZone().resetForm().refresh(false).$message.success('添加成功');
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
            const res = await this.$http.get(GET_ZONE, {
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
            mode: this.zoneMode.fence,
            open: true
        };

        return this;
    }
}


