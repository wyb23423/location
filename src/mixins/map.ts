import Vue from 'vue';
import Component from 'vue-class-component';
import { loopAwait } from '@/assets/utils/util';
import { createMap } from '@/assets/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import MapSelect from '@/components/MapSelect.vue';

@Component({
    components: {
        'map-select': MapSelect,
    }
})
export default class MapMixin extends Vue {
    public mgr?: FengMapMgr | null = null;

    public beforeDestroy() {
        this.dispose();
    }

    public async selectMap(data: IMap) {
        if (data) {
            const dom = <HTMLElement>this.$refs.map;
            if (dom) {
                try {
                    await loopAwait(() => !!dom.offsetWidth && !!dom.offsetHeight);
                    this.dispose();

                    this.mgr = createMap(data, dom);
                    this.bindEvents();
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }

    protected bindEvents() {
        //
    }

    protected dispose() {
        if (this.mgr) {
            this.mgr.dispose();
            this.mgr = undefined;
        }
    }
}
