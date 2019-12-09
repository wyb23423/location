/**
 * 热力图
 */
import { PIXIMgr } from './index';
import { FengMapMgr } from '../fengmap';
import { BaseHeatMap } from '../common';

export default class HeatMap extends BaseHeatMap {
    private sprite = new PIXI.Sprite();

    constructor(config: HeatMapConfig = {}) {
        super(config);

        this.sprite.zIndex = 99999;
        const offset = -config.radius!;
        this.sprite.position.set(offset, offset);
    }

    /**
     * 生成热力图
     * @param stage 舞台容器
     *  类型只能是PIXI.Container, fengmap.FMMap是为了兼容另一种实现
     */
    public render(mgr: PIXIMgr | FengMapMgr) {
        if (!(mgr instanceof PIXIMgr)) {
            return;
        }

        const { _width, _height, children } = <PIXI.Container & { _width: number; _height: number }>mgr.stage;
        this.sprite.texture = PIXI.Texture.from(this.create(_width, _height));
        if (!children.includes(this.sprite)) {
            mgr.stage.addChildAt(this.sprite, mgr.stage.children.length);
        }
    }
    /**
     * 移除热力图
     * @param mgr 地图管理器
     *  类型只能是PIXIMgr, FengMapMgr是为了兼容另一种实现
     */
    public remove(mgr: PIXIMgr | FengMapMgr) {
        mgr instanceof PIXIMgr && mgr.stage.removeChild(this.sprite);
    }
}
