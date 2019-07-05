<template>
    <el-card :class="$style.control">
        <div :class="$style.content">
            <div
                class="flex-center"
                :class="$style.item"
                style="margin-right: 20px"
            >
                <app-select
                    url="/api/tag/getall"
                    v-model="tagNos"
                    :keys="{ name: 'name' }"
                    :multiple="true"
                    :disabled="isStart"
                    @change="change"
                    style="min-width: 200px"
                ></app-select>
                <el-date-picker
                    v-model="date"
                    :disabled="isStart"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    @change="change"
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
                    <span>{{ date | formatTime(progress) }}</span>
                    <el-slider
                        v-model="progress"
                        :disabled="!canPlay"
                        :format-tooltip="format"
                        @input="$emit('progress')"
                        style="flex-grow: 1; padding: 0 15px"
                    ></el-slider>
                    <span>{{ date | formatTime(100) }}</span>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Select from './Select.vue';

@Component({
    components: { 'app-select': Select },
    filters: { formatTime }
})
export default class Control extends Vue {
    public tagNos: string[] = [];
    public date: Date[] = [];
    public isStart: boolean = false;
    public progress: number = 0;
    public showPath: boolean = false;
    public path: any[][] | null = null; // 历史路径

    // tslint:disable-next-line:ban-types
    public format: ((value: number) => string) | null = null; // 格式化 tooltip message

    private timer?: number;
    private tags?: Array<{ id: string; data: ITag; name: string }>;

    public get canPlay() {
        return !!(this.tagNos.length && this.date && this.date.length >= 2);
    }

    public created() {
        this.format = (value: number) => {
            if (!this.date || this.date.length < 2) {
                return value + '';
            }

            return formatTime(this.date, value);
        };
    }

    public destroyed() {
        this._end();
    }

    // 切换路径显示状态
    public switchPathVisible(visible: boolean) {
        this.showPath = visible;
        this.$emit('path', visible);
    }

    // 选择的标签及日期变化时的回调函数
    public change(data: any[]) {
        this.path = null;
        this.progress = 0;
        this.switchPathVisible(false);

        if (!(data[0] instanceof Date)) {
            this.tags = data;
        }
    }

    // 重播放
    public rePlay() {
        this._end().play();
    }

    public play() {
        if (this.isStart) {
            // 暂停
            this.isStart = false;
            this.$emit('pause');
        } else {
            if (this.path) {
                if (this.timer) {
                    // 继续播放
                    this.isStart = true;
                } else {
                    // 从0开始播放
                    this._play();
                }
            } else {
                // 重新获取历史记录
                const startTime = this.date[0].getTime();
                const endTime = this.date[1].getTime();
                if (endTime - startTime < 5000) {
                    return this.$message.warning('时间范围不能低于5秒!');
                }

                if (this.tags) {
                    this.path = this.tags
                        .map(({ data: v }) => [
                            v.tagNo,
                            JSON.parse(
                                localStorage.getItem(v.tagNo) ||
                                    JSON.stringify('')
                            ),
                            v.photo
                        ])
                        .filter(v => !!v[1]);

                    this._play();

                    // this.$http
                    //     .post({
                    //         url: '/api/tag/queryTagHistory',
                    //         body: {
                    //             startTime,
                    //             endTime,
                    //             tagNos: this.tags
                    //         },
                    //         headers: {
                    //             'Content-Type': 'application/json'
                    //         }
                    //     })
                    //     .then(console.log)
                    //     .then(() => (this.isStart = true))
                    //     .catch(console.log);
                }
            }
        }
    }

    private _play() {
        let time = Date.now();
        const onPlay = () => {
            const now = Date.now();
            if (this.isStart) {
                const range = this.date[1].getTime() - this.date[0].getTime();
                this.progress += ((now - time) / range) * 100;
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
        this.$emit('play', this.path);
    }

    private _end() {
        this.progress = 0;
        this.isStart = false;
        if (this.timer) {
            cancelAnimationFrame(this.timer);
            this.timer = undefined;
        }

        return this;
    }
}

function formatTime(date: Date[], progress: number) {
    if (!date || date.length < 2) {
        return '00:00';
    }
    const range = date[1].getTime() - date[0].getTime();
    let time = (range * progress) / 100;

    const DAY_MS: number = 86400000;
    const HOUR_MS: number = 3600000;
    const MINUTE_MS: number = 60000;

    const day = Math.floor(time / DAY_MS);
    time = time % DAY_MS;

    const hour = Math.floor(time / HOUR_MS);
    time = time % HOUR_MS;

    const minute = Math.floor(time / MINUTE_MS);
    time = time % MINUTE_MS;

    const tip: number[] = [minute, Math.round(time / 1000)];
    if (day > 0) {
        tip.unshift(day, hour);
    } else if (hour > 0) {
        tip.unshift(hour);
    }

    return tip.map((v, i) => (i ? v.toString().padStart(2, '0') : v)).join(':');
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

    @media screen and (width <= 768px) {
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

