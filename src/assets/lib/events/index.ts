/**
 * 发布订阅者模式
 */
import { EvtName } from './index.d';

export default class Events {
    // tslint:disable-next-line:ban-types
    public static mixTo(target: object | Function) {
        target = typeof target === 'function' ? target.prototype : target;
        Object.assign(target, Events.prototype);
    }

    // tslint:disable-next-line:ban-types
    private readonly events = new Map<EvtName, Set<Function>>();

    // tslint:disable-next-line:ban-types
    public on(evt: EvtName, handler: Function) {
        if (typeof handler !== 'function') {
            return this;
        }

        const set = this.events.get(evt) || new Set();
        set.add(handler);
        this.events.set(evt, set);

        return this;
    }

    // tslint:disable-next-line:ban-types
    public off(evt: EvtName, handler?: Function) {
        if (!handler) {
            this.events.delete(evt);
        } else {
            const set = this.events.get(evt);
            set && set.delete(handler);
        }

        return this;
    }

    public emit(evt: EvtName, ...args: any[]) {
        return this.trigger(evt, ...args);
    }

    // tslint:disable-next-line:ban-types
    public once(evt: EvtName, handler: Function) {
        if (typeof handler === 'function') {
            const fn = (...args: any[]) => {
                handler(...args);
                this.off(evt, fn);
            };

            this.on(evt, fn);
        }

        return this;
    }

    public trigger(evt: EvtName, ...args: any[]) {
        const set = this.events.get(evt);
        set && set.forEach(fn => fn(...args));

        return this;
    }
}
