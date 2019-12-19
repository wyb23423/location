import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class EventMixin extends Vue {
    private remove = new Set<() => void>();

    public destroyed() {
        this.remove.forEach(f => f());
    }

    protected on(name: PropertyKey, handler: (...args: any[]) => any) {
        this.remove.add(() => this.$event.off(name, handler));
        this.$event.on(name, handler);
    }
}
