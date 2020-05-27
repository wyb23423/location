// tslint:disable:ban-types

/**
 * 发布订阅者模式
 */

export default class Events {
    /**
     * 为一个对象或构造函数添加 发布-订阅 功能
     */
    public static mixTo<T extends Function | object>(target: T) {
        if (typeof target === 'function') {
            const prototype = target.prototype;
            Events.assgin(prototype);

            const fn = (...args: any[]) => {
                const data = Reflect.construct(target, args);
                data.events = new Map<PropertyKey, Set<Function>>();

                return data;
            };

            return <T>fn;
        } else {
            Events.assgin(target);
            (<any>target).events = new Map<PropertyKey, Set<Function>>();

            return target;
        }
    }
    private static assgin(target: Record<string | symbol, any>) {
        const keys = Object.getOwnPropertyNames(Events.prototype);
        keys.forEach(k => {
            if (k !== 'constructor') {
                target[k] = Reflect.get(Events.prototype, k);
            }
        });
    }

    private readonly events = new Map<PropertyKey, Set<Function>>();

    public on(evt: PropertyKey, handler: Function) {
        if (typeof handler !== 'function') {
            return this;
        }

        const set = this.events.get(evt) || new Set();
        set.add(handler);
        console.log(evt, set.size);
        this.events.set(evt, set);

        return this;
    }

    public off(evt: PropertyKey, handler?: Function) {
        if (!handler) {
            this.events.delete(evt);
        } else {
            const set = this.events.get(evt);
            set && set.delete(handler);
        }

        return this;
    }

    public emit(evt: PropertyKey, ...args: any[]) {
        return this.trigger(evt, ...args);
    }

    public once(evt: PropertyKey, handler: Function) {
        if (typeof handler === 'function') {
            const fn = (...args: any[]) => {
                handler(...args);
                this.off(evt, fn);
            };

            this.on(evt, fn);
        }

        return this;
    }

    public trigger(evt: PropertyKey, ...args: any[]) {
        const set = this.events.get(evt);
        set && set.forEach(fn => fn(...args));

        return this;
    }

    public clear() {
        this.events.clear();
        return this;
    }
}

export const events = new Events();

export const SET_BASEID = Symbol('SET_BASEID');
export const SET_MAP = Symbol('SET_MAP');
export const SET_COORDINATE = Symbol('SET_COORDINATE');
export const SET_ERROR_COUNT = Symbol('SET_ERROR_COUNT');
