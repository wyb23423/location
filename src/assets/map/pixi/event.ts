/**
 * pixi地图的缩放及移动事件
 */

import { getPosition } from '@/assets/utils/util';
import * as PIXI from 'pixi.js';

export class MapEvent {
    // 计算两点间距离
    public static getDistance(start: Vector2, stop: Vector2) {
        return Math.sqrt(Math.pow((stop.x - start.x), 2) + Math.pow((stop.y - start.y), 2));
    }

    protected stage: PIXI.Container = new PIXI.Container(); // 场景舞台

    // 用于平移
    private downX: number = 0;
    private downY: number = 0;

    private startDistance: number = 0; // 用于缩放

    constructor(root: HTMLElement) {
        this.stage.interactive = true;

        // ======================================滚动缩放
        root.addEventListener('mousewheel', <EventListener>this.onMouseWheel, false);
        root.addEventListener('DOMMouseScroll', <EventListener>this.onMouseWheel, false);

        // =======================================拖动地图
        root.addEventListener('mousedown', (ev: MouseEvent) => this.downHandler(ev, 'mousemove'));
        root.addEventListener('mouseup', () => this.upHandler('mousemove'));

        root.addEventListener('touchstart', (ev: TouchEvent) => this.downHandler(ev, 'touchmove'));
        root.addEventListener('touchend', () => this.upHandler('touchmove'));
    }

    private onMouseWheel = (ev: MouseEvent) => {
        ev = ev || window.event;
        ev.returnValue = false;
        if (ev.preventDefault) {
            ev.preventDefault();
        }

        if (!this.stage) {
            return;
        }

        let scale = this.stage.scale.x;
        const down = (<any>ev).wheelDelta ? (<any>ev).wheelDelta < 0 : ev.detail > 0;
        if (down) {
            scale *= 9 / 10;
        } else {
            scale *= 11 / 10;
        }

        scale = Math.max(0.3, Math.min(3, scale));
        this.stage.scale.set(scale, scale);
    }

    private downHandler(e: MouseEvent | TouchEvent, type: string) {
        e = e || window.event;

        const pos = getPosition(e);
        this.downX = pos.x;
        this.downY = pos.y;
        if (e instanceof TouchEvent && e.touches.length > 1) {
            this.startDistance = MapEvent.getDistance(pos, {
                x: e.touches[1].clientX,
                y: e.touches[1].clientY
            });
        }

        document.addEventListener(type, <EventListener>this.moveHandler);
    }

    private moveHandler = (ev: MouseEvent | TouchEvent) => {
        ev = ev || window.event;

        ev.returnValue = false;
        if (ev.preventDefault) {
            ev.preventDefault();
        }

        if (!this.stage) {
            return;
        }

        const pos = getPosition(ev);
        if (ev instanceof TouchEvent && ev.touches.length > 1) {
            // 缩放
            const distance = MapEvent.getDistance(pos, {
                x: ev.touches[1].clientX,
                y: ev.touches[1].clientY
            });
            const scale = Math.max(0.3, Math.min(3, this.stage.scale.x * distance / this.startDistance));
            this.stage.scale.set(scale, scale);
        } else {
            // 平移
            const left = this.stage.x + pos.x - this.downX;
            const top = this.stage.y + pos.y - this.downY;

            this.stage.position.set(left, top);

            this.downX = pos.x;
            this.downY = pos.y;
        }
    }

    private upHandler(type: string) {
        document.removeEventListener(type, <EventListener>this.moveHandler);
    }
}

