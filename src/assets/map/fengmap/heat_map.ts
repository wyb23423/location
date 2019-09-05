import { DEFAULT_HEATMAP_CONFIG } from '../common';

export default class HeatMap {
    private instance?: fengmap.IFMHeatMap;

    constructor(config: HeatMapConfig & { map: fengmap.FMMap }) {
        const map = config.map;
        if (map) {
            Reflect.deleteProperty(config, 'map');
            this.instance = fengmap.FMHeatMap.create(map, { ...DEFAULT_HEATMAP_CONFIG, ...config });
        } else {
            console.error('地图错误，无法创建热力图');
        }
    }

    public addPoints(data: PointData[]) {
        this.instance && this.instance.addPoints(data);
    }
    public addPoint(x: number, y: number, value: number) {
        this.instance && this.instance.addPoint(x, y, value);
    }
    public clearPoints() {
        this.instance && this.instance.clearPoints();
    }

    /**
     * 生成热力图
     * @param map 地图对象
     *  类型只能是fengmap.FMMap, PIXI.Container是为了兼容另一种实现
     * @param groupID 楼层数
     */
    public render(map: fengmap.FMMap | PIXI.Container, groupID?: number) {
        if (!(this.instance && map instanceof fengmap.FMMap)) {
            return;
        }

        map.getFMGroup(groupID || map.focusGroupID || 0)
            .applyHeatMap(this.instance);
    }
    /**
     * 移除热力图
     * @param map 地图对象
     *  类型只能是fengmap.FMMap, PIXI.Container是为了兼容另一种实现
     * @param groupID 楼层数
     */
    public remove(map: fengmap.FMMap | PIXI.Container, groupID?: number) {
        if (!(this.instance && map instanceof fengmap.FMMap)) {
            return;
        }

        map.getFMGroup(groupID || map.focusGroupID || 0)
            .removeHeatMap(this.instance);
    }
}
