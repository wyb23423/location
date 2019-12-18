<template>
    <div class="map-box">
        <div
            ref="map"
            id="map-box"
            style="height: 100%; overflow: hidden"
        ></div>

        <el-collapse v-model="activeNames" :class="$style.collapse">
            <el-collapse-item name="collapse" title="数据设置">
                <div :class="$style['tool-bar']">
                    <el-radio-group size="small" v-model="type">
                        <el-radio-button label="time">
                            所有标签某一时刻的热力图
                        </el-radio-button>
                        <el-radio-button label="interval">
                            部分标签在一个时段的热力图
                        </el-radio-button>
                    </el-radio-group>
                    <div style="margin: 20px 0">
                        <map-select @selectmap="selectMap"></map-select>
                        <el-button
                            icon="el-icon-download"
                            :disabled="!canDownload"
                            style="margin-left: 10px"
                            @click="download"
                        ></el-button>
                    </div>
                </div>

                <el-form :model="form" label-width="auto" ref="form">
                    <el-form-item
                        :label="`${type === 'interval' ? '开始' : ''}时间`"
                        prop="start"
                        required
                    >
                        <el-date-picker v-model="form.start" type="datetime">
                        </el-date-picker>
                    </el-form-item>
                    <template v-if="type === 'interval'">
                        <el-form-item label="结束时间" prop="end" required>
                            <el-date-picker v-model="form.end" type="datetime">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="标签" prop="tags" required>
                            <tag-select
                                @change="form.tags = $event"
                                :multiple="true"
                            ></tag-select>
                        </el-form-item>
                    </template>
                    <el-form-item>
                        <el-button
                            type="success"
                            icon="el-icon-edit-outline"
                            :disabled="!canPaint"
                            @click="paint"
                        >
                            绘制
                        </el-button>
                        <el-button
                            type="danger"
                            icon="el-icon-brush"
                            :disabled="!canDownload"
                            @click="clear"
                        >
                            清除
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import MapMixin from '../../mixins/map';
import FMHeatMap from '@/assets/map/fengmap/heat_map';
import PXHeatMap from '@/assets/map/pixi/heat_map';
import { createHeatMap } from '@/assets/map';
import { download } from '@/assets/utils/download';
import { randomNum, Async } from '../../assets/utils/util';
import { FengMapMgr } from '@/assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';
import { GET_INSTANT, GET_HISTORY } from '@/constant/request';
import TagSelect from '@/components/form/TagSelect.vue';
import { ElForm } from 'element-ui/types/form';
import { Ref } from 'vue-property-decorator';
import { Loading } from '@/mixins/loading';

interface IntervalFormData {
    start: Date | null;
    end: Date | null;
    tags: string[];
}

@Component({
    components: {
        'tag-select': TagSelect
    }
})
export default class HeatMap extends mixins(MapMixin, Loading) {
    public canDownload = false;
    public activeNames = ['collapse'];
    public type: 'time' | 'interval' = 'time';
    public form: IntervalFormData = {
        start: null,
        end: null,
        tags: []
    };

    private heatMap!: FMHeatMap | PXHeatMap;
    // 上次选择的数据用于减少不必要的操作
    private old: Partial<IntervalFormData> = {};

    // 地图大小(定位)
    private width!: number;
    private height!: number;

    @Ref('form') private readonly elForm!: ElForm;

    public get canPaint() {
        const isPaintTime = this.type === 'time';
        const { start, end, tags } = this.form;

        if (!start) {
            return false;
        }

        if (!isPaintTime && !(tags.length && end)) {
            return false;
        }

        const old = this.old;
        if (start === old.start) {
            if (isPaintTime) {
                return false;
            }

            if (
                old.tags &&
                tags.length === old.tags.length &&
                old.tags.every(v => tags.includes(v))
            ) {
                return end !== old.end;
            }
        }

        return true;
    }

    @Async()
    public async paint() {
        if (!this.mgr) {
            return console.error('地图错误');
        }

        await this.elForm.validate();

        this.heatMap = this.heatMap || createHeatMap(<any>{});
        this.heatMap.clearPoints();

        this.loading();
        await (this.type === 'time' ? this.paintTime() : this.paintInterval());
        await this.heatMap.render(this.mgr!);
        this.loaded();

        this.$message.success('绘制完成');

        this.activeNames = [];
        const { start, end, tags } = this.form;
        this.old = { start, end, tags: [...tags] };
        this.canDownload = true;
    }

    public clear() {
        if (!this.mgr) {
            return console.error('地图错误');
        }

        this.old = {};
        this.canDownload = false;
        this.heatMap.remove(this.mgr);
        this.$message.success('已清除');
    }

    public download() {
        if (!this.container) {
            return console.error('地图容器错误');
        }

        const canvas = this.container.children[0];
        if (!(canvas instanceof HTMLCanvasElement)) {
            return console.error('画布错误');
        }

        const isPaintTime = this.type === 'time';
        const { start, end } = this.form;
        const timeStr = start
            ? `${start.toJSON()}${isPaintTime && end ? '_' + end.toJSON() : ''}`
            : 'unknown';

        this.heatMap.download(canvas, `heatmap_${timeStr}.png`);
    }

    // =========================================地图生命周期
    protected initData(data: IMap) {
        this.old = {};
        [this.width, this.height] = <number[]>data.margin[4];
    }
    protected bindEvents() {
        this.mgr!.on('loadComplete', () => {
            this.tagAnchor();
            this.heatMap = createHeatMap(this.mgr!);
        });
    }
    protected dispose() {
        this.mgr && this.heatMap.remove(this.mgr);
    }
    // ==============================================

    // 绘制时刻热力图
    @Async()
    private async paintTime() {
        const {
            pagedData: { datas }
        }: ResponseData<ITagInfo> = await this.$http.get({
            url: GET_INSTANT,
            data: {
                time: this.form.start,
                mapId: this.mapId
            }
        });
        if (!datas.length) {
            this.$message.info('没有历史数据');
            return Promise.reject();
        }

        const { mgr, heatMap } = this;
        datas.forEach(v => {
            const { x, y } = mgr!.getCoordinate(
                {
                    x: +v.position[0],
                    y: +v.position[1]
                },
                true
            );
            heatMap.addPoint(x, y, 100);
        });
    }

    // 绘制时段热力图
    @Async(console.error)
    private async paintInterval() {
        const arr = this.fetchData();
        if (!arr) {
            return;
        }

        const grid = await Promise.all(arr);
        // tslint:disable-next-line:prefer-const
        let { data, length } = grid.shift()!;
        grid.forEach(v => {
            v.data.forEach((p, i) => p && this.addValue(data, i, p));
            length += v.length;
        });

        if (!length) {
            this.$message.info('没有历史数据');
            return Promise.reject();
        }

        data.forEach(v => {
            if (v && v.value) {
                const { x, y } = this.mgr!.getCoordinate(v, true);
                this.heatMap.addPoint(x, y, (v.value / length) * 1000);
            }
        });
    }

    private fetchData() {
        const timeInterval = 120000;
        const { start, end } = this.form;
        const endTime = end!.getTime();
        let startTime = start!.getTime();
        let fEndTime = startTime + timeInterval;

        if (startTime + 60000 > endTime) {
            this.$message.warning('开始时间必须小于结束时间一分钟');
            return;
        }

        if (endTime - startTime > 10800000) {
            this.$message.warning('选择的时间范围不得超过3小时');
            return;
        }

        const interval = Math.min(Math.max(this.width, this.height) / 100, 20);
        const arr: Array<
            Promise<{ data: Array<PointData | undefined>; length: number }>
        > = [];

        while (fEndTime < endTime) {
            arr.push(this.request(startTime, fEndTime, interval));
            startTime = fEndTime;
            fEndTime = startTime + timeInterval;
        }
        arr.push(this.request(startTime, endTime, interval));

        return arr;
    }

    private request(start: number, end: number, interval: number) {
        return this.$http
            .post({
                url: GET_HISTORY,
                body: {
                    startTime: new Date(start),
                    endTime: new Date(end),
                    tagNos: this.form.tags,
                    mapId: this.mapId
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((res: ResponseData<ITagInfo>) => {
                return this.poly(interval, res.pagedData.datas);
            });
    }

    private findGridInfo(interval: number, { position }: ITagInfo) {
        const xNum = Math.floor(this.width / interval) + 1;
        const x = Math.floor(+position[0] / interval);
        const y = Math.floor(+position[1] / interval);

        return {
            index: (y - 1) * xNum + x,
            x: (x + 1 / 2) * interval,
            y: (y + 1 / 2) * interval
        };
    }

    // 聚合热力点数据
    private poly(interval: number, datas: ITagInfo[]) {
        const xNum = Math.floor(this.width / interval) + 1;
        const yNum = Math.floor(this.height / interval) + 1;
        const dataGrid: Array<PointData | undefined> = new Array(xNum * yNum);

        let count = 0;
        datas.forEach(v => {
            if (this.groups.includes(v.groupNo)) {
                const { index, x, y } = this.findGridInfo(interval, v);
                this.addValue(dataGrid, index, { x, y, value: 1 });
                count++;
            }
        });

        return { data: dataGrid, length: count };
    }

    // 为热力点数据增加热力值
    private addValue(
        arr: Array<PointData | undefined>,
        index: number,
        data: PointData
    ) {
        if (!arr[index]) {
            arr[index] = data;
        } else {
            arr[index]!.value += data.value;
        }

        return arr[index];
    }
}
</script>

<style lang="postcss" module>
.tool-bar {
    justify-content: space-between;
    align-items: center;
    padding: 0 5%;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}

.collapse {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    z-index: 9;

    & div[role='button'] {
        background: #f2f2f2;
        padding-left: 10px;
        border-bottom: 1px solid #ccc;
    }

    & div[role='tabpanel'] {
        padding: 10px;
        background: rgba(255, 255, 255, 0.8);
    }
}
</style>