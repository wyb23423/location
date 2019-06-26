
import Component, { mixins } from 'vue-class-component';

import MapMixin from '@/mixins/map';

@Component
export default class Fence extends mixins(MapMixin) {
    protected bindEvents() {
        this.mgr!.on('loadComplete', () => {
            this.tagAnchor();
        });
    }
}
