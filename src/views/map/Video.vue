<template>
    <div class="map-box flex-center" style="flex-direction: column;">
        <video ref="video" :class="$style.video"></video>
        <div :class="['flex-center', $style.config]">
            <el-checkbox v-model="isTrack">追踪模式</el-checkbox>

            <div style="margin: 0 10px">
                <TagSelect @change="tag = $event" v-show="isTrack"></TagSelect>
                <Select
                    placeholder="请选择摄像头"
                    v-show="!isTrack"
                    :url="GET_CAMERA"
                    v-model.number="camera"
                ></Select>
            </div>

            <el-button
                icon="el-icon-finished"
                plain
                @click="switchVideo"
            ></el-button>
        </div>
    </div>
</template>

<script lang="ts">
import { WebSocketInit } from '@/mixins/monitor/websocket';
import Component from 'vue-class-component';
import TagSelect from '@/components/form/TagSelect.vue';
import { Ref, Watch } from 'vue-property-decorator';
import Select from '@/components/form/Select.vue';
import { REQUEST_CAMERA } from '@/constant/request';
import FlvJs from 'flv.js';

@Component({
    components: {
        TagSelect,
        Select
    }
})
export default class Video extends WebSocketInit {
    public readonly GET_CAMERA = REQUEST_CAMERA;

    public isTrack = false; // 是否自动追踪某个标签
    public tag = '';
    public camera = -1;

    private groupNo = ''; // 追踪标签当前所在的组
    private player?: FlvJs.Player;

    @Ref('video') private readonly video!: HTMLVideoElement;

    public switchVideo() {
        this.player?.destroy();

        if (this.isTrack) {
            // TODO
        }

        // TODO
    }

    protected handler(data: ITagInfo) {
        this.groupNo = data.groupNo;
        // TODO
    }

    protected isValid(data: ITagInfo) {
        return (
            this.isTrack &&
            data.sTagNo === this.tag &&
            data.position.every(v => +v >= 0) &&
            data.groupNo !== this.groupNo
        );
    }

    protected async initTagAll() {
        //
    }
}
</script>

<style lang="postcss" module>
.video {
    width: 70%;
    height: 70%;
    background: #000;
    border-radius: 5px 5px 0 0;
}

.config {
    width: 70%;
    padding: 10px;
    background: #fff;
    border-radius: 0 0 5px 5px;

    justify-content: flex-end;
}
</style>