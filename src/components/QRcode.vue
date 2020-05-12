<template>
    <div :class="$style.box" v-show="visible" ref="box">
        <div :class="$style.bg"></div>
        <video ref="video" autoplay :class="$style.video" v-show="hasVideo">
            您的浏览器不支持video
        </video>
        <div :class="$style['viewfinder-box']">
            <div :class="$style.viewfinder">
                <div v-for="v of [1, 2, 3, 4]" :key="v"></div>
                <hr :class="$style.scan" />
            </div>
        </div>
        <div :class="$style['top-control']">
            <el-button
                size="small"
                icon="el-icon-back"
                round
                :class="$style.button"
                @click="close()"
            ></el-button>
            <el-button
                size="small"
                icon="el-icon-full-screen"
                round
                :class="$style.button"
                @click="fullScreen"
                v-show="!isFullScreen"
            ></el-button>
            <el-button
                size="small"
                icon="el-icon-refresh-right"
                round
                :class="$style.button"
                @click="play"
            ></el-button>
        </div>

        <el-upload
            accept="image/jpeg, image/png"
            :auto-upload="false"
            action=""
            :show-file-list="false"
            :on-change="changeUpload"
            style="bottom: 100px; width: 100%; text-align: center; z-index: 3"
        >
            <el-button
                :class="$style.button"
                @click="isFullScreen && fullScreen(200)"
            >
                选择二维码文件
            </el-button>
        </el-upload>
        <p :class="$style.tip">请将条码置于取景框内扫描</p>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Ref } from 'vue-property-decorator';
import { Async } from '../assets/utils/util';
import { ElUploadInternalFileDetail } from 'element-ui/types/upload';
import { Message } from 'element-ui';
import EventMixin from '@/mixins/event';

const SHOT_TIMER_NAME = Symbol('视频截图');

@Component
export default class QRcode extends mixins(EventMixin) {
    public visible = false; // 是否显示
    public hasVideo = false; // 是否显示视频

    private deviceId?: string; // 当前摄像头deviceId

    @Ref('video') private readonly video!: HTMLVideoElement;
    @Ref('box') private readonly box!: HTMLDivElement;

    public created() {
        const onerror = (e: WindowEventMap['error']) => {
            if (e.message === 'Uncaught The input is not a PNG file!') {
                this.$message.error('解析失败!');
            }
        };
        window.addEventListener('error', onerror, false);

        this.addRemoveCall(() =>
            window.removeEventListener('error', onerror, false)
        );
    }

    public mounted() {
        document.body.appendChild(this.box);
    }

    /**
     * 打开扫描器
     */
    public async open() {
        await this.play();
        await this.fullScreen();
        this.visible = true;
    }
    /**
     * 关闭扫描器
     */
    public async close(data?: string) {
        try {
            this.isFullScreen && (await this.exitFull());
        } catch (e) {
            //
        }

        this.deviceId = void 0;
        this.visible = false;
        this.$emit('close', data);
    }

    public changeUpload(file: ElUploadInternalFileDetail) {
        if (file.raw.type !== 'image/png' && file.raw.type !== 'image/jpeg') {
            return this.$message.error('只能选择jpg/png文件!');
        }

        if (file.size / 1024 / 1024 > 5) {
            return this.$message.error('文件大小不能超过 5MB!');
        }

        this.parse(file.raw).catch(() => this.$message.error('解析失败!'));
    }

    /**
     * 切换摄像头并播放
     */
    @Async(onPlayError)
    public async play() {
        const mediaDevices = navigator.mediaDevices;
        const devices = await mediaDevices.enumerateDevices();

        let device: MediaDeviceInfo | void;
        for (const v of devices) {
            if (v.kind === 'videoinput') {
                device = v;

                if (this.deviceId) {
                    if (v.deviceId !== this.deviceId) {
                        break;
                    }
                } else if (v.label.includes('back')) {
                    break;
                }
            }
        }

        device && (this.deviceId = device.deviceId);
        const stream = await mediaDevices.getUserMedia({
            video: device || true,
            audio: false
        });

        const { width, height } = stream.getVideoTracks()[0].getSettings();
        this.shot(width || 500, height || 1000);

        this.video.srcObject = stream;
        this.hasVideo = true;
    }

    /**
     * 开启截图循环
     */
    private shot(width: number, height: number) {
        this.clearTimer(SHOT_TIMER_NAME);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return this.$message.error('您的浏览器不支持canvas');
        }

        const fn = () => {
            if (!this.video) {
                return;
            }

            ctx.drawImage(this.video, 0, 0, width, height, 0, 0, width, height);
            canvas.toBlob(blob => {
                this.parse(blob).catch(() =>
                    this.setTimeout(SHOT_TIMER_NAME, fn, 200)
                );
            });
        };
        fn();
    }

    /**
     * 解析“二维码”图片
     */
    private async parse(raw: File | Blob | null) {
        if (!raw) {
            return;
        }

        const data = await qrcodeParser(raw);
        if (data.includes('laienwei_base_no')) {
            this.$message('解析成功');
            this.close(data);
        } else if (data.startsWith('http')) {
            location.href = data;
        } else if (data.includes('err')) {
            return Promise.reject();
        } else {
            document.write(`<div style="word-break:break-all;">${data}</div>`);
        }
    }
}

function onPlayError(e: any) {
    if (typeof e === 'string') {
        return Message.error(e);
    }

    if (e instanceof DOMException) {
        return Message.error(`${e.name}: ${e.message}`);
    }

    Message.error('Requested device not found');
}

declare const qrcode: any;
function qrcodeParser(raw: File | Blob): Promise<string> {
    const getObjectURL = (file: File | Blob) => {
        let url = null;
        const w: any = window;
        if (w.createObjectURL != null) {
            // basic
            url = w.createObjectURL(file);
        } else if (w.URL != null) {
            // mozilla(firefox)
            url = w.URL.createObjectURL(file);
        } else if (w.webkitURL != null) {
            // webkit or chrome
            url = w.webkitURL.createObjectURL(file);
        }

        return url;
    };

    qrcode.decode(getObjectURL(raw));
    return new Promise(resolve => (qrcode.callback = resolve));
}
</script>

<style lang="postcss" module>
@define-mixin position-mixin $position {
    position: $(position);
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
}

.box {
    @mixin position-mixin fixed;
    z-index: 1002;

    & > *:not(video) {
        position: absolute;
    }
}

.bg {
    width: 100%;
    height: 100%;
    background: #333;
}

.video {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.viewfinder-box {
    @mixin position-mixin absolute;
    background: none;
    border-width: calc(50vh - 120px) calc(50vw - 120px);
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.6);
    z-index: 2;
}

.viewfinder {
    width: 100%;
    height: 100%;
    border: 1px solid #fff;

    & > div {
        position: absolute;
        border-style: solid;
        border-width: 0;
        border-color: #fff;
        width: 15px;
        height: 15px;
    }
}

@each $v1, $v2, $i in (top, top, bottom, bottom), (left, right, right, left),
    (1, 2, 3, 4)
{
    .viewfinder div:nth-child($(i)) {
        $(v1): 0px;
        $(v2): 0px;
        border-$(v1)-width: 3px;
        border-$(v2)-width: 3px;
    }
}

.button {
    background: rgba(0, 0, 0, 0) !important;
    color: #ebeef5 !important;
    font-size: 12px;
}

.top-control {
    z-index: 3;
    top: 0;
    left: 0;
    padding-right: 5px;
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > * {
        border: none !important;
        font-size: 16px !important;
    }
}

.tip {
    width: 100%;
    bottom: 20px;
    left: 0;
    color: #ebeef5;
    text-align: center;
    font-size: 12px;
    z-index: 3;
}

.scan {
    margin: 0 auto;
    margin-top: 2%;
    height: 2px;
    background: linear-gradient(to right, #666, 25%, #fff, 75%, #666);
    border: none;
    width: 98%;

    animation: scan 5s ease-in-out infinite;
}

@keyframes scan {
    %0 {
        margin-top: 2%;
    }
    50% {
        margin-top: 98%;
    }
    100% {
        margin-top: 2%;
    }
}
</style>