import Vue from 'vue';
import Component from 'vue-class-component';
import { loopAwait } from '../assets/utils/util';
import { Prop } from 'vue-property-decorator';
import { table2Excel } from '../assets/utils/download';
import Table from '@/components/Table.vue';

interface TableData {
    count: number;
    data: any[];
}

@Component({
    components: {
        'app-table': Table
    }
})
export default class TableMixin extends Vue {
    @Prop() public permission!: Permission;

    public totalCount: number = 0;
    public tableData: any[] = [];
    public maxHeight: number = 100;
    public colCfg: any[] = [];
    protected pageSize: number = 10;
    protected page: number = 1;

    public get op(): any[] {
        return this.permission && this.permission.delete
            ? [{ type: 'danger', name: 'del', desc: '删除' }]
            : [];
    }

    public created() {
        this.getData(1, 10);
    }
    public mounted() {
        this.getMaxHeight();
    }

    public async getData(page: number, pageSize: number) {
        this.pageSize = pageSize;
        this.page = page;

        const res = await this.fetch(page, pageSize);
        this.totalCount = res.count;
        this.tableData = res.data;
    }
    public async toExcel() {
        const body = await this.bodyStr();
        table2Excel(this.headStr() + body);
    }

    /**
     * 获取表格数据
     */
    protected async fetch(page: number, pageSize: number): Promise<TableData> {
        return { count: 0, data: [] };
    }

    /**
     * 刷新列表
     * @param isRemove 是否是删除操作
     * @param page 页数
     */
    protected refresh(isRemove: boolean = true, page?: number) {
        if (page == null) {
            if (isRemove) {
                page = this.tableData.length > 1
                    ? this.page
                    : this.page - 1;
            } else {
                page = this.page;
            }
        }

        this.getData(Math.max(1, page), this.pageSize);

        return this;
    }

    private headStr() {
        const thead = ['<thead><tr>'];
        this.colCfg.forEach(v => thead.push(`<th>${v.label}</th>`));
        thead.push('</tr></thead>');
        return thead.join('');
    }
    private async bodyStr() {
        const data = (await this.fetch(this.page, Math.min(this.totalCount, 2000))).data;
        const tbody = ['<tbody>'];
        data.forEach(v => {
            tbody.push('<tr>');
            this.colCfg.forEach(c => tbody.push(
                `<td style="mso-number-format:'\@'">${
                v[c.prop] == null ? ' ' : v[c.prop]
                }</td>`
            ));
            tbody.push('</tr>');
        });
        tbody.push('</tbody>');
        return tbody.join('');
    }
    private async getMaxHeight() {
        const component: any = this.$refs.table;
        if (component) {
            const dom: HTMLElement = component.$el || component;
            if (dom) {
                try {
                    await loopAwait(() => !!dom.offsetHeight);
                    this.maxHeight = dom.offsetHeight * 0.85;
                } catch (e) {
                    console.log(e);
                }

            }
        }
    }
}
