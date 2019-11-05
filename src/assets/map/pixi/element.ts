import Stage from './stage';
import { getCustomInfo } from '../common';
import { randomNum } from '@/assets/utils/util';
import { Animation, PIXIEL, ElAnimation } from './animation';

/**
 * pixi 实现监控的图标管理类
 */
export class ElsMgr extends Stage {
    protected animation = new Animation();
    private els: Map<string | number, PIXIEL[]> = new Map(); // 已添加到舞台上的元素

    /**
     * 移除添加到舞台上的元素
     */
    public remove(name?: string | number) {
        this.find(name).forEach(v => this.stage.removeChild(v));
        if (name != null) {
            this.els.delete(name);
        } else {
            this.els.clear();
        }
    }

    // =================================================创建
    /**
     * 创建多边形
     * @param coords 坐标信息
     * @param name 标识符
     * @param isMapCoor 是否已是显示坐标
     */
    public createPolygonMarker(
        coords: Vector2[],
        name: string,
        isMapCoor: boolean = false,
        gid?: number
    ) {
        const points = coords.map(v => {
            if (!isMapCoor) {
                v = this.getCoordinate(v, true) || v;
            }

            return [v.x, v.y];
        }).flat();

        const triangle = new PIXI.Graphics();
        triangle.beginFill(randomNum(0, 0xffffff), 0.5); // 填充色
        triangle.lineStyle(2, randomNum(0, 0xffffff), 1); // 边框

        triangle.drawPolygon(points);
        triangle.interactive = true;
        triangle.buttonMode = true;

        this.save(triangle, name);
    }

    /**
     * 添加文本
     */
    public addTextMarker(
        coord: Vector2 & IJson,
        name: string,
        isMapCoor: boolean = false,
        gid?: number
    ): Promise<any> {
        if (!name) {
            return Promise.reject('no text');
        }

        let newlist = {
            x: coord.x || coord.xaxis || 0,
            y: coord.y || coord.yaxis || 0
        };

        // tslint:disable-next-line:no-conditional-assignment
        if (!isMapCoor) {
            newlist = this.getCoordinate(newlist, true);
        }

        return new Promise(resolve => {
            const message = new PIXI.Text(name, {
                fill: coord.fillcolor || 0xee0000,
                fontSize: coord.fontsize || 20,
                stroke: coord.strokecolor || 0xffff00,
                strokeThickness: 1,
                ...coord
            });
            message.position.set((<Vector23>newlist).x, (<Vector23>newlist).y);
            message.anchor.set(0.5, 0.5);

            this.save(message, name);

            resolve(message);
        });
    }

    public addImage(
        opt: any,
        name?: string | number,
        gid?: number,
        isMapCoor: boolean = true
    ): Vector3 {
        let p = { x: opt.x, y: opt.y, z: opt.z || 0 };

        if (!isMapCoor) {
            p = this.getCoordinate(p, true) || p;
        }

        this.load(opt.url).then(([texture]) => {
            const img = new PIXI.Sprite(texture);

            if (opt.size != null) {
                img.width = img.height = opt.size;
            }

            img.anchor.set(0.5);
            img.position.set(p.x, p.y);

            img.interactive = true;
            img.buttonMode = true;
            img.zIndex = Math.ceil(opt.height || 0);

            this.save(img, (name || JSON.stringify(p)) + '');

            if (opt.callback) {
                opt.callback(img);
            }
        });

        return p;
    }
    // ==============================================================

    public modifyImg(name: string | number, img?: string) {
        this.find(name).forEach(v => {
            if (v instanceof PIXI.Text || v instanceof PIXI.Graphics) {
                return;
            }

            img = img || getCustomInfo<ITag>(v, 'info').icon;
            if (img) {
                this.load(img)
                    .then(([texture]) => v.texture = texture)
                    .catch(console.log);
            }
        });
    }

    // =======================================动画
    // 移动
    public moveTo(
        name: string | number,
        coord: Vector23,
        time: number = 1, // 动画时间
        update?: (v: Vector2) => void, // 移动时回调
        callback?: () => void, // 移动完成时回调
        isMapCoor: boolean = false,
    ) {
        if (!isMapCoor) {
            coord = this.getCoordinate(coord, true);
        }

        const action = this.animation.createMoveTo(coord, time, update, callback);
        this.find(name).forEach(action);
    }
    public stopMoveTo(name?: string | number) {
        this.stopAnimation('moveTo', name);
    }
    public twinkle(name: string | number, count?: number, time?: number) {
        const action = this.animation.createTwinkle(count, time);
        this.find(name).forEach(action);
    }
    public stopAnimation(type: keyof ElAnimation, name?: string | number) {
        this.find(name).forEach(v => this.animation.stop(v, type));
    }
    // ======================================================================

    /**
     * 查找标记为name的元素
     * @param isName 是否通过tagName查找
     */
    public find(name?: string | number, isName: boolean = false) {
        if (name == null) {
            return Array.from(this.els.values()).flat();
        }

        if (isName) {
            const result: PIXIEL[] = [];
            this.els.forEach(v =>
                result.push(...v.filter(m => getCustomInfo<{ tagName: string }>(m, 'info').tagName === name))
            );

            return result;
        }

        return this.els.get(name) || [];
    }

    public dispose() {
        super.dispose();
        this.els.clear();
    }

    private save(el: any, name: string | number) {
        this.stage.addChild(el);

        const els = this.els.get(name) || [];
        els.push(el);
        this.els.set(name, els);
    }
}
