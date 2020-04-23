import Vue from 'vue';
import Component from 'vue-class-component';
import { Async } from '@/assets/utils/await';

enum TimerType {
    ANIMATION = 0,
    TIME_OUT = 1,
    TIMER_INTERVAL = 2
}

@Component
export default class EventMixin extends Vue {
    public isFullScreen = false; // 是否浏览器全屏

    private timers = new Map<PropertyKey, [TimerType, number]>();
    private remove = new Set<() => void>();
    private windowHeight = window.innerHeight;

    public created() {
        const onresize = () =>
            (this.isFullScreen = window.innerHeight > this.windowHeight);
        window.addEventListener('resize', onresize, false);
        this.remove.add(() => window.removeEventListener('resize', onresize, false));
    }

    public destroyed() {
        this.remove.forEach(f => f());
        this.clearTimer();
    }

    /**
     * 浏览器全屏
     */
    @Async()
    public async fullScreen(delay: number = 0) {
        if (typeof delay === 'number' && delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (this.isFullScreen) {
            return;
        }

        const el: any = document.body;
        const rfs =
            el.requestFullscreen ||
            el.webkitRequestFullScreen ||
            el.mozRequestFullScreen ||
            el.msRequestFullScreen;
        if (typeof rfs !== 'undefined' && rfs) {
            return rfs.call(el);
        } else if (typeof window.ActiveXObject !== 'undefined') {
            // for IE，这里其实就是模拟了按下键盘的F11，使浏览器全屏
            const wscript = new ActiveXObject('WScript.Shell');
            if (wscript != null) {
                return wscript.SendKeys('{F11}');
            }
        }
    }
    /**
     * 退出浏览器全屏
     */
    public exitFull() {
        // 判断各种浏览器，找到正确的方法
        const doc: any = document;
        const exitMethod =
            doc.exitFullscreen || // W3C
            doc.mozCancelFullScreen || // FireFox
            doc.webkitExitFullscreen || // Chrome等
            doc.webkitExitFullscreen; // IE11
        if (exitMethod) {
            return exitMethod.call(document);
        } else if (typeof window.ActiveXObject !== 'undefined') {
            // for Internet Explorer
            const wscript = new ActiveXObject('WScript.Shell');
            if (wscript !== null) {
                return wscript.SendKeys('{F11}');
            }
        }
    }

    /**
     * 添加组件销毁时执行的函数
     */
    protected addRemoveCall(fn: () => void) {
        this.remove.add(fn);
        return this;
    }

    /**
     * 添加自定义全局事件
     */
    protected on(name: PropertyKey, handler: (...args: any[]) => any) {
        this.remove.add(() => this.$event.off(name, handler));
        this.$event.on(name, handler);

        return this;
    }

    // =============================timer
    // tslint:disable-next-line:ban-types
    protected setTimeout(name: PropertyKey, handler: Function, timeout?: number, ...args: any[]) {
        const timer = setTimeout(() => {
            this.clearTimer(name);
            handler(...args);
        }, timeout);
        this.timers.set(name, [TimerType.TIME_OUT, timer]);

        return timer;
    }
    // tslint:disable-next-line:ban-types
    protected setInterval(name: PropertyKey, handler: Function, timeout?: number, ...args: any[]) {
        const timer = setInterval(() => {
            this.clearTimer(name);
            handler(...args);
        }, timeout);
        this.timers.set(name, [TimerType.TIMER_INTERVAL, timer]);

        return timer;
    }
    protected requestAnimationFrame(name: PropertyKey, callback: () => void) {
        const timer = requestAnimationFrame(() => {
            this.clearTimer(name);
            callback();
        });
        this.timers.set(name, [TimerType.ANIMATION, timer]);

        return timer;
    }
    protected clearTimer(name?: PropertyKey) {
        const timers = name ? [this.timers.get(name)] : this.timers.values();
        for (const timer of timers) {
            if (timer) {
                switch (timer[0]) {
                    case TimerType.ANIMATION:
                        cancelAnimationFrame(timer[1]);
                        break;
                    case TimerType.TIME_OUT:
                        clearTimeout(timer[1]);
                        break;
                    case TimerType.TIMER_INTERVAL:
                        clearInterval(timer[1]);
                        break;
                    default: break;
                }
            }
        }

        name ? this.timers.delete(name) : this.timers.clear();
    }
}
