<template>
    <el-card :class="$style.control">
        <div :class="$style.content">
            <div
                class="flex-center"
                :class="$style.item"
                style="margin-right: 20px;"
            >
                <app-select
                    url="/api/tag/getall"
                    v-model="tagNos"
                    :keys="{ id: 'tagNo', name: 'name' }"
                    :multiple="true"
                    :disabled="isStart"
                    @change="change($event, true)"
                    style="min-width: 200px"
                ></app-select>
                <el-date-picker
                    v-model="dateProxy"
                    :disabled="isStart"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    @change="change($event, false)"
                    style="margin: 0 20px;"
                >
                </el-date-picker>
                <el-switch
                    v-model="showPath"
                    active-text="显示"
                    inactive-text="隐藏"
                    :disabled="!path"
                    @change="switchPathVisible"
                    style="flex-shrink: 0;"
                >
                </el-switch>
            </div>
            <div class="flex-center" :class="$style.item">
                <el-button
                    :icon="
                        isStart ? 'el-icon-video-pause' : 'el-icon-video-play'
                    "
                    :disabled="!canPlay"
                    type="text"
                    @click="play"
                    style="font-size: 24px"
                ></el-button>
                <el-button
                    icon="el-icon-refresh"
                    :disabled="!canPlay || !path"
                    type="text"
                    @click="rePlay"
                    style="font-size: 24px"
                ></el-button>
                <div class="flex-center" :class="$style.progress">
                    <span>{{ timeRange | formatTime(progress) }}</span>
                    <el-slider
                        v-model="progress"
                        :disabled="!canPlay"
                        :format-tooltip="format"
                        @input="$emit('progress', $event)"
                        @change="$emit('play', $event)"
                        style="flex-grow: 1; padding: 0 15px"
                    ></el-slider>
                    <span>{{ timeRange | formatTime(100) }}</span>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Select from './Select.vue';
import { formatTime } from '@/assets/utils/util';
import { Prop } from 'vue-property-decorator';

export interface PositionItem extends Vector3 {
    time: number;
}

export interface HistoryPath {
    id: string;
    position: PositionItem[];
    icon: string;
}

@Component({
    components: { 'app-select': Select },
    filters: { formatTime }
})
export default class Control extends Vue {
    @Prop() public date!: Date[] | null;
    @Prop() public path!: HistoryPath[] | null; // 历史路径

    public tagNos: string[] = [];
    public isStart: boolean = false;
    public progress: number = 0;
    public showPath: boolean = false;

    // tslint:disable-next-line:ban-types
    public format: ((value: number) => string) | null = null; // 格式化 tooltip message

    private timer?: number;
    private tags?: Array<{ id: string; data: ITag; name: string }>;

    public get dateProxy() {
        return this.date;
    }
    public set dateProxy(date: Date[] | null) {
        this.$emit('update:date', date);
    }

    public get canPlay() {
        return !!(this.tagNos.length && this.date && this.date.length >= 2);
    }
    public get timeRange() {
        if (this.date && this.date.length >= 2) {
            return this.date[1].getTime() - this.date[0].getTime();
        }

        return 0;
    }

    public created() {
        this.format = (value: number) => formatTime(this.timeRange, value);
    }
    public destroyed() {
        this._end();
    }

    // 切换路径显示状态
    public switchPathVisible(visible: boolean) {
        this.showPath = visible;
        this.$emit('pathVisible', visible);
    }
    // 选择的标签及日期变化时的回调函数
    public change(data: any[] | null, isTag: boolean) {
        this.$emit('update:path', null);
        this.progress = 0;
        this.switchPathVisible(false);

        if (isTag) {
            this.tags = data || undefined;
        }
    }
    // 重播放
    public rePlay() {
        this._end().play();
    }
    public play() {
        if (this.isStart) {
            // 暂停
            this._end(this.progress);
            this.$emit('pause');
        } else {
            if (this.path) {
                this._play();
            } else if (this.tags) {
                // 重新获取历史记录
                this.$http
                    .post({
                        url: '/api/tag/queryTagHistory',
                        body: {
                            startTime: this.date![0],
                            endTime: this.date![1],
                            tagNos: this.tagNos
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((res: ResponseData) => {
                        const datas: ITagInfo[] = res.pagedData.datas;
                        if (!datas.length) {
                            return Promise.reject();
                        }
                        return Promise.resolve(datas);
                    })
                    .then(this.parsePath.bind(this))
                    .catch((e: any) => this.$message.error('未查询到历史轨迹'));
            } else {
                this.$message.warning('请选择标签');
            }
        }
    }

    private parsePath(datas: ITagInfo[]) {
        this.isStart = true; // 禁止改变时间及标签

        const path: { [id: string]: PositionItem[] } = {};
        datas.forEach(v => {
            const id = v.position[0];
            const data: PositionItem = {
                x: +v.position[1],
                y: +v.position[2],
                z: +v.position[3] || 0,
                time: new Date(<string>v.time).getTime()
            };
            if (data.x >= 0 && data.y >= 0 && data.z >= 0) {
                (path[id] || (path[id] = [])).push(data);
            }
        });

        if (this.tags) {
            const tmp: HistoryPath[] = [];
            for (const [id, position] of Object.entries(path)) {
                const tag = this.tags.find(v => v.id === id);
                if (tag) {
                    tmp.push({ id, position, icon: tag.data.photo });
                }
            }

            if (tmp.length) {
                this.$emit('update:path', tmp);
                this._play();
            }
        }
    }

    private _play() {
        if (this.timer) {
            cancelAnimationFrame(this.timer);
            this.timer = undefined;
        }

        let time = Date.now();
        const onPlay = () => {
            const now = Date.now();
            if (this.isStart) {
                this.progress += ((now - time) / this.timeRange) * 100;
            }

            if (this.progress >= 100) {
                this._end();
            } else {
                this.timer = requestAnimationFrame(onPlay);
            }

            time = now;
        };

        this.isStart = true;
        onPlay();
        this.$emit('play', this.progress);
    }

    private _end(progress: number = 0) {
        this.progress = progress;
        this.isStart = false;
        if (this.timer) {
            cancelAnimationFrame(this.timer);
            this.timer = undefined;
        }

        return this;
    }
}
</script>


<style lang="postcss" module>
.control {
    position: absolute;
    bottom: 0;
    width: 100%;

    & > div {
        padding: 10px;
    }
}

.content {
    display: flex;
    justify-content: space-between;

    @media screen and (width <= 1260px) {
        flex-wrap: wrap;
    }
}

.progress {
    justify-content: space-between;
    flex-grow: 1;
    margin-left: 10px;
}
.item {
    justify-content: space-between;
    width: 100%;
}
</style>

<style>
.el-range-separator {
    min-width: 20px;
}
</style>

