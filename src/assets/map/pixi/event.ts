/**
 * pixi地图的缩放及移动事件
 */

import * as PIXI from 'pixi.js';
import { DEVICE_PIXEL_RATIO } from '@/constant';

export class MapEvent {
    // 获取点击点
    public static getPosition(e: MouseEvent | TouchEvent) {
        if (e instanceof MouseEvent) {
            return {
                x: e.clientX,
                y: e.clientY
            };
        } else if (e instanceof TouchEvent) {
            if (!e.touches.length) {
                return {
                    x: 0,
                    y: 0
                };
            }
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }

        console.error('事件对象错误: 事件对象必须是MouseEvent或TouchEvent');

        return { x: 0, y: 0 };
    }

    // 计算两点间距离
    public static getDistance(start: Vector2, stop: Vector2) {
        return ((stop.x - start.x) ** 2 + (stop.y - start.y) ** 2) ** 0.5;
    }

    // 用于平移
    private downX: number = 0;
    private downY: number = 0;
    private startDistance: number = 0; // 用于缩放

    /**
     * 将事件绑定到对应的pixi地图上
     * @param root pixi地图容器
     * @param stage 作为舞台使用的PIXI.Container
     */
    public apply(root: HTMLElement, stage: PIXI.Container) {
        stage.interactive = true;

        // ======================================滚动缩放
        const onMouseWheel = <EventListener>((e: MouseEvent) => this.onMouseWheel(e, stage));
        root.addEventListener('mousewheel', onMouseWheel, false);
        root.addEventListener('DOMMouseScroll', onMouseWheel, false);

        // =======================================拖动地图
        const moveHandler = (e: MouseEvent | TouchEvent) => this.moveHandler(e, stage);

        const onMouseDown = (e: MouseEvent) => {
            this.downHandler(e);
            root.addEventListener('mousemove', moveHandler);
        };
        root.addEventListener('mousedown', onMouseDown, false);

        const onMouseUp = () => root.removeEventListener('mousemove', moveHandler);
        root.addEventListener('mouseup', onMouseUp, false);

        const onTouchStart = (e: TouchEvent) => {
            this.downHandler(e);
            root.addEventListener('touchmove', moveHandler);
        };
        root.addEventListener('touchstart', onTouchStart, false);

        const onTouchEnd = () => root.removeEventListener('touchmove', moveHandler);
        root.addEventListener('touchend', onTouchEnd, false);

        this.dispose = () => {
            root.removeEventListener('mousewheel', onMouseWheel, false);
            root.removeEventListener('DOMMouseScroll', onMouseWheel, false);
            root.removeEventListener('mousedown', onMouseDown, false);
            root.removeEventListener('mouseup', onMouseUp, false);
            root.removeEventListener('touchstart', onTouchStart, false);
            root.removeEventListener('touchend', onTouchEnd, false);
        };
    }

    public dispose() {
        //
    }

    private onMouseWheel(ev: MouseEvent, stage: PIXI.Container) {
        ev = ev || window.event;
        ev.returnValue = false;
        if (ev.preventDefault) {
            ev.preventDefault();
        }

        let scale = stage.scale.x;
        const down = (<any>ev).wheelDelta ? (<any>ev).wheelDelta < 0 : ev.detail > 0;
        if (down) {
            scale *= 9 / 10;
        } else {
            scale *= 11 / 10;
        }

        scale = Math.max(0.1, 0.4 / DEVICE_PIXEL_RATIO, Math.min(6 / DEVICE_PIXEL_RATIO, scale));
        stage.scale.set(scale, scale);
    }

    private downHandler(e: MouseEvent | TouchEvent) {
        e = e || window.event;

        const pos = MapEvent.getPosition(e);
        this.downX = pos.x;
        this.downY = pos.y;
        if (e instanceof TouchEvent && e.touches.length > 1) {
            this.startDistance = MapEvent.getDistance(pos, {
                x: e.touches[1].clientX,
                y: e.touches[1].clientY
            });
        }
    }

    private moveHandler(ev: MouseEvent | TouchEvent, stage: PIXI.Container) {
        ev = ev || window.event;

        ev.returnValue = false;
        if (ev.preventDefault) {
            ev.preventDefault();
        }

        const pos = MapEvent.getPosition(ev);
        if (ev instanceof TouchEvent && ev.touches.length > 1) {
            // 缩放
            const distance = MapEvent.getDistance(pos, {
                x: ev.touches[1].clientX,
                y: ev.touches[1].clientY
            });
            const scale = Math.max(
                0.1, 0.4 / DEVICE_PIXEL_RATIO,
                Math.min(6 / DEVICE_PIXEL_RATIO, stage.scale.x * distance / this.startDistance)
            );
            stage.scale.set(scale, scale);
        } else {
            // 平移
            const left = stage.x + (pos.x - this.downX) / DEVICE_PIXEL_RATIO;
            const top = stage.y + (pos.y - this.downY) / DEVICE_PIXEL_RATIO;

            stage.position.set(left, top);

            this.downX = pos.x;
            this.downY = pos.y;
        }
    }
}

