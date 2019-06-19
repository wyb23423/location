import Vue from 'vue';
import Component from 'vue-class-component';
import { MapData } from '@/assets/map/map';
import { loopAwait } from '@/assets/utils/util';
import { createMap } from '@/assets/map';
import { FengMapMgr } from '@/assets/map/fengmap';
import MapSelect from '@/components/MapSelect.vue';

@Component({
    components: {
        'map-select': MapSelect,
    }
})
export default class SelectMapMixin extends Vue {
    public mgr?: FengMapMgr;

    public destroyed() {
        this.dispose();
    }

    public async selectMap(data: MapData) {
        if (data) {
            const dom = <HTMLElement>this.$refs.map;
            if (dom) {
                try {
                    await loopAwait(() => !!dom.offsetWidth && !!dom.offsetHeight);

                    this.dispose();

                    this.mgr = createMap(data, dom);
                    this.bindClickEvent();
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }

    protected bindClickEvent() {
        //
    }

    protected dispose() {
        if (this.mgr) {
            this.mgr.dispose();
            this.mgr = undefined;
        }
    }
}
