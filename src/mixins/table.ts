import Vue from 'vue';
import Component from 'vue-class-component';
import { loopAwait } from '@/assets/utils/util';
import { Watch } from 'vue-property-decorator';

@Component
export default class TableMixin extends Vue {
    public totalCount: number = 0;
    public tableData: any[] = [];
    public maxHeight: number = 100;

    public created() {
        this.getData(1, 10);
    }

    public mounted() {
        this.getMaxHeight();
    }

    public getData(page: number, pageSize: number) {
        //
    }

    @Watch('$store.state.rootScale')
    private async getMaxHeight() {
        const dom: HTMLElement = (<any>this.$refs.table).$el;
        if (dom) {
            await loopAwait(() => !!dom.offsetHeight);
            this.maxHeight = dom.offsetHeight * 0.85;
        }
    }
}
