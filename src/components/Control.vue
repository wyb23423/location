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
                    v-model="tags"
                    :keys="{ id: 'tagNo', name: 'name' }"
                    :multiple="true"
                    @change="change"
                    style="min-width: 200px"
                ></app-select>
                <el-date-picker
                    v-model="date"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="margin: 0 20px;"
                >
                </el-date-picker>
                <el-switch
                    v-model="showPath"
                    active-text="显示"
                    inactive-text="隐藏"
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
                    style="font-size: 24px"
                ></el-button>
                <el-button
                    icon="el-icon-refresh"
                    :disabled="!canPlay"
                    type="text"
                    style="font-size: 24px"
                ></el-button>
                <div class="flex-center" :class="$style.progress">
                    <span>{{ date | formatTime(progress) }}</span>
                    <el-slider
                        v-model="progress"
                        :disabled="!canPlay"
                        :format-tooltip="format"
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
    public tags: string[] = [];
    public date: Date[] = [];
    public isStart: boolean = false;
    public progress: number = 0;
    public showPath: boolean = false;

    // tslint:disable-next-line:ban-types
    public format: ((value: number) => string) | null = null; // 格式化 tooltip message

    public get canPlay() {
        return !!(this.tags.length && this.date && this.date.length >= 2);
    }

    public created() {
        this.format = (value: number) => {
            if (!this.date || this.date.length < 2) {
                return value + '';
            }

            return formatTime(this.date, value);
        };
    }

    public change(ids: string[]) {
        console.log(ids);
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
    /* align-items: center; */
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

