import { PIXIAnimation, Action } from '@/types/pixi-action';
import * as PIXI from 'pixi.js';
import 'pixi-action';

export interface ElAnimation {
    moveTo?: PIXIAnimation | null;
    twinkle?: PIXIAnimation | null;
}

export type PIXIEL = (PIXI.Text | PIXI.Sprite | PIXI.Graphics) & { animation: ElAnimation | null };

/**
 * pixi 动画
 */
export class Animation {
    public createMoveTo(
        coord: Vector23,
        time: number = 1, // 动画时间
        update?: (v: Vector2) => void, // 移动时回调
        callback?: (v: PIXIEL) => void // 移动完成时回调
    ) {
        const action = new PIXI.action.MoveTo(coord.x, coord.y, time);
        return (item: PIXIEL) => this.add(item, 'moveTo', action, update, callback);
    }

    public createTwinkle(count: number = Infinity, time: number = 0.3) {
        const action = new PIXI.action.Blink(count, time);
        return (item: PIXIEL) => this.add(item, 'twinkle', action);
    }

    public stop(item: PIXIEL, type: keyof ElAnimation) {
        if (item.animation && item.animation[type]) {
            PIXI.actionManager.cancelAction(item.animation[type]!);
            item.animation = null;
        }
    }

    private add(
        item: PIXIEL,
        type: keyof ElAnimation,
        action: Action,
        update?: (v: Vector2) => void,
        callback?: (v: PIXIEL) => void,
    ) {
        const elAnimation = item.animation || (item.animation = {});

        if (elAnimation[type]) {
            PIXI.actionManager.cancelAction(elAnimation[type]!);
        }

        const animation = PIXI.actionManager.runAction(item, action);
        animation.on('update', (s: PIXI.Container) => {
            if (update) {
                update(s.position);
            }
        });
        animation.on('end', () => {
            if (item.animation) {
                item.animation.moveTo = null;
            }

            callback && callback(item);
        });

        item.animation[type] = animation;
    }
}
