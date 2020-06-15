<template>
    <div class="map-box flex-center" style="flex-direction: column;">
        <div
            :class="$style.video"
            v-loading="isLoading"
            element-loading-background="rgba(0, 0, 0, 0.2)"
        >
            <video ref="video1" controls v-show="play === 1">
                Your browser is too old which doesn't support HTML5 video.
            </video>
            <video ref="video2" controls v-show="play === 2">
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
                :value="camera.slice(camera.lastIndexOf('|') + 1)"
                @change="camera = $event[0].data.url + '|' + $event[0].id"
                @init="groupCamera"
                style="margin: 0 10px"
            ></Select>

            <el-button
                icon="el-icon-finished"
                plain
                :disabled="isLoading"
                :loading="isLoading"
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
import { getConfig } from '@/assets/utils/util';

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
    public play = 2;
    public isLoading = false;
    public groupNo = ''; // 追踪标签当前所在的组

    private readonly videoServer = getConfig(
        'FLV_TARGET',
        'http://127.0.0.1:3001'
    ).replace(/\/+$/, '');

    private player1?: FlvJs.Player;
    private player2?: FlvJs.Player;
    private cameras = new Map<string, ICamera[]>();
    private oldCamera?: string;
    private time?: number;

    @Ref('video1') private readonly video1!: HTMLVideoElement;
    @Ref('video2') private readonly video2!: HTMLVideoElement;

    public created() {
        this.initWebSocket();
    }

    public destroyed() {
        this.player1?.destroy();
        this.player2?.destroy();
    }

    public async switchVideo() {
        if (!this.camera || this.camera === this.oldCamera) {
            return;
        }

        const i = this.play === 1 ? 2 : 1;
        const key = ('player' + i) as 'player1' | 'player2';

        this[key] = FlvJs.createPlayer(
            {
                type: 'flv',
                isLive: true,
                hasAudio: false,
                url:
                    this.videoServer +
                    '/videoapi?url=' +
                    this.camera.slice(0, this.camera.lastIndexOf('|'))
            },
            {
                enableWorker: true,
                enableStashBuffer: false,
                stashInitialSize: 128
            }
        );

        const timer = setTimeout(() => {
            this[key]?.destroy();
            this.isLoading = false;
            this.$message.error('获取数据超时');
        }, 15000);
        this[key]!.on(FlvJs.Events.ERROR, (...args) => {
            this.isLoading = false;
            this.$message.error(JSON.stringify(args));
        });

        this[key]!.attachMediaElement(Reflect.get(this, 'video' + i));
        this[key]!.load();

        const oldPlayer: FlvJs.Player = Reflect.get(this, 'player' + this.play);
        this.isLoading = true;
        oldPlayer?.pause();

        await this[key]!.play();

        clearTimeout(timer);
        this.play = i;
        this.isLoading = false;
        oldPlayer?.destroy();

        this.oldCamera = this.camera;
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
        const cameras = this.cameras.get(data.groupNo);
        if (!cameras) {
            return;
        }

        let camera = cameras[0];
        for (let i = 2; i < cameras.length; i++) {
            const dis1 = this.distance(camera.description, data.position);
            const dis2 = this.distance(cameras[i].description, data.position);

            dis2 < dis1 && (camera = cameras[i]);
        }

        camera && (this.camera = camera.url + '|' + camera.id);
        this.switchVideo();
    }

    protected isValid(data: ITagInfo) {
        // 节流
        const now = Date.now();
        if (this.time && now - this.time < 10000) {
            return false;
        }
        this.time = now;

        return (
            this.isTrack &&
            data.sTagNo === this.tag &&
            data.position.every(v => +v >= 0)
        );
    }

    // 不需要全部标签数据, 重写为空
    protected async initTagAll() {
        //
    }

    private distance(pos1: Vector2, pos2: string[]) {
        return ((pos1.x - +pos2[0]) ** 2 + (pos1.y - +pos2[1]) ** 2) ** 1 / 2;
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