<template>
    <div class="map-box flex-center" style="flex-direction: column;">
        <div :class="$style.video">
            <video ref="video" controls>
                Your browser is too old which doesn't support HTML5 video.
            </video>
        </div>
        <div :class="['flex-center', $style.config]">
            <!-- <el-checkbox v-model="isTrack">追踪模式</el-checkbox> -->

            <div style="margin: 0 10px">
                <TagSelect @change="tag = $event" v-show="isTrack"></TagSelect>
                <Select
                    placeholder="请选择摄像头"
                    v-show="!isTrack"
                    :url="GET_CAMERA"
                    value=""
                    @change="camera = $event[0].url"
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
    public camera: string = '';

    private groupNo = ''; // 追踪标签当前所在的组
    private player?: FlvJs.Player;

    @Ref('video') private readonly video!: HTMLVideoElement;

    public created() {
        // this.initWebSocket();
    }

    public destroyed() {
        this.player?.destroy();
    }

    public switchVideo() {
        // TODO 追踪模式（目前不能确定使用哪个摄像头）

        this.createPlayer();
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

    private createPlayer() {
        if (!this.camera) {
            return;
        }

        this.player?.destroy();
        this.player = FlvJs.createPlayer({
            type: 'flv',
            isLive: true,
            hasAudio: false,
            url: '/videoapi?url=' + this.camera
        });
        this.player.attachMediaElement(this.video);
        this.player.load();
        this.player.play();
    }
}
</script>

<style lang="postcss" module>
.video {
    padding: 20px;
    width: 70%;
    height: 70%;
    background: #000;
    border-radius: 5px 5px 0 0;

    & > video {
        width: 100%;
        height: 100%;
        outline: 0;
    }
}

.config {
    width: 70%;
    padding: 10px;
    background: #fff;
    border-radius: 0 0 5px 5px;

    justify-content: flex-end;
}
</style>