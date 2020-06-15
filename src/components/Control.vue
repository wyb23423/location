<template>
    <el-card :class="$style.control">
        <div :class="$style.content">
            <div
                class="flex-center"
                :class="$style.item"
                style="margin-right: 20px;"
            >
                <tag-select
                    :disabled="isPlaying"
                    :multiple="true"
                    :multiple-limit="3"
                    @change="tagNos = $event"
                    @remote="setIcons"
                    style="min-width: 200px"
                >
                </tag-select>
                <el-date-picker
                    v-model="dateProxy"
                    :disabled="isPlaying"
                    type="datetimerange"
                    value-format="timestamp"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    @change="change"
                    style="margin: 0 20px;"
                >
                </el-date-picker>
                <el-switch
                    v-model="showPathProxy"
                    active-text="显示"
                    inactive-text="隐藏"
                    :disabled="!hasData"
                    style="flex-shrink: 0;"
                >
                </el-switch>
            </div>
            <div class="flex-center" :class="$style.item">
                <el-button
                    :icon="
                        isPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'
                    "
                    :disabled="!canPlay"
                    type="text"
                    @click="play"
                    style="font-size: 24px"
                ></el-button>
                <el-button
                    :disabled="!hasData"
                    icon="el-icon-refresh"
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
                        @input="$emit('progress')"
                        @change="$emit('play')"
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
import Component, { mixins } from 'vue-class-component';
import { formatTime } from '@/assets/lib/date';
import ControlMixin from '@/mixins/control';
import { Prop, Emit } from 'vue-property-decorator';
import TagSelect from './form/TagSelect.vue';

interface Option {
    label: string;
    value: string;
}

@Component({
    components: { 'tag-select': TagSelect },
    filters: { formatTime }
})
export default class Control extends mixins(ControlMixin) {
    @Prop() public readonly showPath!: boolean; // 是否显示轨迹

    public loading: boolean = false;
    public isPlaying: boolean = false; // 是否正在播放

    private timer?: number; // 播放定时器

    public get showPathProxy() {
        return this.showPath;
    }
    public set showPathProxy(visible: boolean) {
        this.$emit('update:showPath', visible);
    }

    public destroyed() {
        this.pause();
    }

    @Emit('set-icons')
    public setIcons(data: ITag[]) {
        const icons = new Map<string, string>();
        data.forEach(v => icons.set(v.id, v.icon));

        return icons;
    }

    public format(value: number) {
        return formatTime(this.timeRange, value);
    }
    // 选择的标签及日期变化时的回调函数
    public change() {
        this.hasData = this.showPathProxy = false;
        this.progress = 0;
    }
    // 重播放
    public rePlay() {
        this.pause();
        Promise.resolve().then(this.play.bind(this));
    }
    public play() {
        if (this.isPlaying) {
            // ========================暂停
            this.pause(this.progress).$emit('pause');
        } else {
            if (this.hasData) {
                this.isPlaying = true;
                this._play();
            } else if (this.tagNos.length) {
                // =======================重新获取历史记录

                // 立即进入播放状态, 禁止修改时间及标签
                this.isPlaying = true;

                this.loadData()
                    .then(this._play.bind(this))
                    .catch((message: string) => {
                        message && this.$message.error(message);
                        this.isPlaying = false;
                    });
            } else {
                this.$message.warning('请选择标签');
            }
        }
    }

    // 暂停播放
    public pause(progress: number = 0) {
        if (this.timer) {
            cancelAnimationFrame(this.timer);
            this.timer = undefined;
        }
        this.progress = progress;
        this.isPlaying = false;

        return this;
    }

    private _play() {
        if (this.timer) {
            cancelAnimationFrame(this.timer);
            this.timer = undefined;
        }

        let time = Date.now();
        const onPlay = () => {
            const now = Date.now();
            if (this.isPlaying) {
                this.progress += ((now - time) / this.timeRange) * 100;
            }

            if (this.progress >= 100) {
                this.pause();
            } else {
                this.timer = requestAnimationFrame(onPlay);
            }

            time = now;
        };

        onPlay();
        this.$emit('play');
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

