import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class EventMixin extends Vue {
    private remove?: () => void;

    public destroyed() {
        this.remove && this.remove();
    }

    protected on(name: string | symbol | number, handler: (...args: any[]) => any) {
        this.remove = () => this.$event.off(name, handler);
        this.$event.on(name, handler);
    }
}
