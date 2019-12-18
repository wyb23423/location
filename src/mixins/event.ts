import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class EventMixin extends Vue {
    protected timers = new Map<PropertyKey, number>();
    private remove = new Set<() => void>();

    public destroyed() {
        this.remove.forEach(f => f());
        this.timers.forEach(clearTimeout);
    }

    protected on(name: PropertyKey, handler: (...args: any[]) => any) {
        this.remove.add(() => this.$event.off(name, handler));
        this.$event.on(name, handler);
    }

    protected setTimeout(name: PropertyKey, handler: TimerHandler, timeout: number, ...args: any[]) {
        this.clearTimeout(name);

        const timer = setTimeout(handler, timeout, ...args);
        this.timers.set(name, timer);

        return timer;
    }

    protected clearTimeout(name: PropertyKey) {
        const timer = this.timers.get(name);
        timer && clearTimeout(timer);
    }
}
