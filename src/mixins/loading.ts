import { LoadingServiceOptions, ElLoadingComponent } from 'element-ui/types/loading';
import Vue from 'vue';

export class Loading extends Vue {
    private timer?: number;
    private marker?: ElLoadingComponent;

    public loading(options: LoadingServiceOptions = {}, timeout: number = 60000) {
        this.marker = this.$loading(options);
        this.timer = setTimeout(this.loaded.bind(this), timeout);
    }

    public loaded() {
        this.timer && clearTimeout(this.timer);
        this.marker && this.marker.close();

        this.marker = this.timer = undefined;
    }
}
