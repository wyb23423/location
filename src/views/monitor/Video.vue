<template>
    <div class="map-box flex-center" style="flex-direction: column;">
        <div :class="$style.video">
            <video ref="video" controls>
                Your browser is too old which doesn't support HTML5 video.
            </video>
        </div>
        <div :class="['flex-center', $style.config]">
            <el-checkbox v-model="isTrack">追踪模式</el-checkbox>
            <div v-show="isTrack">
                <TagSelect
                    @change="tag = $event"
                    style="margin: 0 10px"
                ></TagSelect>
                <el-select v-model="camera" placeholder="请选择摄像头">
                    <el-option
                        v-for="item of cameras.get(groupNo)"
                        :key="item.id"
                        :label="item.name"
                        :value="item.url + '|' + item.id"
                    >
                    </el-option>
                </el-select>
            </div>

            <Select
                v-show="!isTrack"
                placeholder="请选择摄像头"
                :url="GET_CAMERA"
                value=""
                @change="camera = $event[0].url + '|' + $event[0].id"
                @init="groupCamera"
                style="margin: 0 10px"
            ></Select>

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
import { GET_CAMERA } from '@/constant/request';
import FlvJs from 'flv.js';

@Component({
    components: {
        TagSelect,
        Select
    }
})
export default class Video extends WebSocketInit {
    public readonly GET_CAMERA = GET_CAMERA;

    public isTrack = false; // 是否自动追踪某个标签
    public tag = '';
    public camera: string = '';

    private groupNo = ''; // 追踪标签当前所在的组
    private player?: FlvJs.Player;
    private cameras = new Map<string, ICamera[]>();

    @Ref('video') private readonly video!: HTMLVideoElement;

    public created() {
        this.initWebSocket();
    }

    public destroyed() {
        this.player?.destroy();
    }

    public switchVideo() {
        // TODO 追踪模式（简易）

        this.createPlayer();
    }

    public groupCamera(data: Array<ICamera<string>>) {
        this.cameras.clear();
        data.forEach(v => {
            if (!v.description) {
                return;
            }

            const arr = this.cameras.get(v.groupId) || [];
            arr.push({ ...v, description: JSON.parse(v.description) });

            this.cameras.set(v.groupId, arr);
        });
    }

    protected handler(data: ITagInfo) {
        this.groupNo = data.groupNo;
        // TODO
    }

    protected isValid(data: ITagInfo) {
        return (
            this.isTrack &&
            data.sTagNo === this.tag &&
            data.position.every(v => +v >= 0)
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
            url:
                '/videoapi?url=' +
                this.camera.slice(0, this.camera.lastIndexOf('|'))
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