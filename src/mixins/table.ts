import Vue from 'vue';
import Component from 'vue-class-component';
import { loopAwait } from '@/assets/utils/util';
import { Watch } from 'vue-property-decorator';
import table2Excel from '@/assets/utils/table2excel';

interface TableData {
    count: number;
    data: any[];
}

@Component
export default class TableMixin extends Vue {
    public totalCount: number = 0;
    public tableData: any[] = [];
    public maxHeight: number = 100;
    public colCfg: any[] = [];

    public created() {
        this.getData(1, 10);
    }

    public mounted() {
        this.getMaxHeight();
    }

    public async getData(page: number, pageSize: number) {
        const res = await this._getData(page, pageSize);
        this.totalCount = res.count;
        this.tableData = res.data;
    }

    public async _getData(page: number, pageSize: number): Promise<TableData> {
        return { count: 0, data: [] };
    }

    public async toExcel() {
        const body = await this.bodyStr();
        table2Excel(this.headStr() + body);
    }

    @Watch('$store.state.rootScale')
    private async getMaxHeight() {
        const dom: HTMLElement = (<any>this.$refs.table).$el;
        if (dom) {
            await loopAwait(() => !!dom.offsetHeight);
            this.maxHeight = dom.offsetHeight * 0.85;
        }
    }

    private headStr() {
        const thead = ['<thead><tr>'];
        this.colCfg.forEach(v => thead.push(`<th>${v.label}</th>`));
        thead.push('</tr></thead>');

        return thead.join('');
    }

    private async bodyStr() {
        const data = (await this._getData(1, this.totalCount)).data;

        const tbody = ['<tbody>'];
        data.forEach(v => {
            tbody.push('<tr>');
            this.colCfg.forEach(c => tbody.push(`<td>${v[c.prop]}</td>`));
            tbody.push('</tr>');
        });
        tbody.push('</tbody>');

        return tbody.join('');
    }
}
