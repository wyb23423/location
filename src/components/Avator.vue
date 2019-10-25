<template>
    <div>
        <div @click="selectAvator">
            <el-tooltip effect="dark" content="人员" placement="bottom-end">
                <el-image
                    :class="{
                        [$style.avatar]: true,
                        [$style.selected]: imgIndex === 0
                    }"
                    :src="pImg"
                    fit="contain"
                    data-index="0"
                ></el-image>
            </el-tooltip>
            <el-tooltip effect="dark" content="物品" placement="bottom-end">
                <el-image
                    :class="{
                        [$style.avatar]: true,
                        [$style.selected]: imgIndex === 1
                    }"
                    :src="itemImg"
                    fit="contain"
                    data-index="1"
                ></el-image>
            </el-tooltip>
            <el-tooltip effect="dark" content="自定义" placement="bottom-end">
                <el-image
                    :class="{
                        [$style.avatar]: true,
                        [$style.selected]: imgIndex === 2
                    }"
                    :src="customUrl || '/images/true.png'"
                    fit="contain"
                    data-index="2"
                >
                </el-image>
            </el-tooltip>
        </div>

        <el-dialog
            :visible.sync="visible"
            :modal-append-to-body="false"
            append-to-body
            width="70%"
            top="5vh"
            title="裁剪头像"
            :class="$style.model"
        >
            <div
                class="el-divider el-divider--horizontal"
                :class="$style.divider"
            ></div>
            <div :class="$style.btn">
                <span style="margin-right: 20px;">本地上传</span>
                <el-upload
                    accept="image/jpeg, image/png"
                    :auto-upload="false"
                    action=""
                    :show-file-list="false"
                    :on-change="changeUpload"
                >
                    <el-button size="small" type="primary">选择文件</el-button>
                </el-upload>
            </div>
            <el-row style="margin: 20px 0">
                <el-col :span="16" :xs="24" style="height: 400px">
                    <VueCropper
                        ref="cropper"
                        :img="url"
                        :autoCrop="true"
                        :fixed="true"
                        :fixedNumber="[1, 1]"
                        outputType="webp"
                        @realTime="realTime"
                        v-if="!!url"
                    ></VueCropper>
                    <el-upload
                        drag
                        accept="image/jpeg, image/png"
                        :auto-upload="false"
                        action=""
                        :show-file-list="false"
                        v-else
                        class="avatar-upload"
                        :on-change="changeUpload"
                    >
                        <div :class="$style.center">
                            <div>
                                <i class="el-icon-upload"></i>
                                <div :class="$style.tip">
                                    将文件拖到此处，或
                                    <em style="color: #66ccff">选择文件</em>
                                </div>
                                <div :class="$style.tip">
                                    只能上传jpg/png文件，且不超过5M
                                </div>
                            </div>
                        </div>
                    </el-upload>
                </el-col>

                <el-col :span="7" :xs="23" :offset="1">
                    <el-row>
                        <el-col
                            :class="$style.preview"
                            :style="{
                                ...previewBox,
                                zoom: 200 / preview.w
                            }"
                            :span="24"
                            :xs="10"
                        >
                            <div :style="preview.div">
                                <img :src="preview.url" :style="preview.img" />
                            </div>
                        </el-col>
                        <el-col
                            :class="$style.preview"
                            :style="{
                                ...previewBox,
                                zoom: 100 / preview.w
                            }"
                            :span="24"
                            :ofsset="1"
                            :xs="8"
                        >
                            <div :style="preview.div">
                                <img :src="preview.url" :style="preview.img" />
                            </div>
                        </el-col>
                        <el-col
                            :class="$style.preview"
                            :style="{
                                ...previewBox,
                                zoom: 50 / preview.w
                            }"
                            :span="24"
                            :ofsset="1"
                            :xs="4"
                        >
                            <div :style="preview.div">
                                <img :src="preview.url" :style="preview.img" />
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="6" :xs="24">
                    <el-button type="primary" style="width: 100%" @click="ok">
                        确 定
                    </el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Model } from 'vue-property-decorator';
import { ElUploadInternalFileDetail } from 'element-ui/types/upload';
import { base642blob } from '../assets/utils/util';

@Component
export default class Avator extends Vue {
    @Model('change') public avatar!: string;

    public url: string = ''; // 选择的图片
    public visible: boolean = false;

    // 预览图父div大小
    public previewBox: { width: string; height: string } = {
        width: '1024px',
        height: '1024px'
    };
    public preview: any = null; // 裁剪预览
    public imgIndex: number = 0;
    public customUrl: string = '';

    public pImg = '/images/P.png';
    public itemImg = '/images/item.png';

    public created() {
        this.preview = {
            url: '/images/true.png',
            div: this.previewBox,
            w: 1024
        };

        if (this.avatar) {
            if (this.avatar === this.itemImg) {
                this.imgIndex = 1;
            } else if (this.avatar !== this.pImg) {
                this.imgIndex = 2;
                this.preview.url = this.url = this.customUrl = this.avatar;
            }
        } else {
            this.$emit('change', this.pImg);
        }
    }

    public changeUpload(file: ElUploadInternalFileDetail) {
        if (file.raw.type !== 'image/png' && file.raw.type !== 'image/jpeg') {
            return this.$message.error('只能上传jpg/png文件!');
        }

        if (file.size / 1024 / 1024 > 5) {
            return this.$message.error('上传文件大小不能超过 5MB!');
        }

        this.url = URL.createObjectURL(file.raw);
    }

    public realTime(data: any) {
        this.preview = data;

        this.previewBox = {
            width: data.w + 'px',
            height: data.h + 'px'
        };
    }

    public ok() {
        const cropper: any = this.$refs.cropper;
        if (cropper) {
            cropper.getCropData((data: string) => {
                this.customUrl = data;
                this.$emit('change', data);
                this.$message.success('设置成功');

                this.imgIndex = 2;
                this.visible = false;
            });
        } else {
            this.$message.warning('请选择图片!!!');
        }
    }

    public selectAvator(e: Event) {
        const index = +(<string>(<HTMLImageElement>e.target).dataset.index);

        if (!isNaN(index) && index >= 0 && index <= 2) {
            const oldIndex = this.imgIndex;

            if (index < 2) {
                this.imgIndex = index;
            } else if (index === 2) {
                if (this.customUrl) {
                    this.imgIndex = 2;
                }

                this.visible = true;
            }

            if (oldIndex !== this.imgIndex) {
                this.$emit('change', this.getUrl());
            }
        }
    }

    public getImgUrl(name: string) {
        const url = this.getUrl();
        const tagPhoto = this.getcanvas(url, name)
            .then(
                c =>
                    new Promise<Blob | null>(resolve =>
                        c.toBlob(resolve, 'image/png', 1)
                    )
            )
            .then(photo => {
                if (!photo) {
                    return Promise.reject('获取头像数据失败');
                }

                return this.$http.post('/api/tag/upload/tagPhoto', {
                    tagPhoto: photo
                });
            });

        let avatar = Promise.resolve<ResponseData>({
            code: 200,
            message: '',
            pagedData: {
                currentPage: 1,
                datas: [],
                pageSize: 0,
                totalCount: 0
            },
            success: true,
            resultMap: {
                photoUrl: url
            }
        });
        if (this.imgIndex > 1) {
            avatar = this.$http.post('/api/tag/upload/tagPhoto', {
                tagPhoto: base642blob(this.customUrl)
            });
        }

        return Promise.all([tagPhoto, avatar]);
    }

    private getcanvas(
        url: string,
        text?: string,
        canvas: HTMLCanvasElement = document.createElement('canvas')
    ): Promise<HTMLCanvasElement> {
        const img = new Image();
        img.src = url;

        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = 100;
                canvas.height = text ? 100 : 70;
                const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

                if (text) {
                    if (ctx.font !== '20px Arial') {
                        ctx.font = '20px Arial';
                    }
                    if (ctx.strokeStyle !== 'blue') {
                        ctx.strokeStyle = 'blue';
                    }
                    if (ctx.textAlign !== 'center') {
                        ctx.textAlign = 'center';
                    }

                    ctx.fillText(text, 50, 80);
                }

                ctx.drawImage(img, 25, 10, 50, 50);
                resolve(canvas);
            };

            img.onerror = reject;
        });
    }

    private getUrl() {
        return [this.pImg, this.itemImg, this.customUrl][this.imgIndex];
    }
}
</script>

<style lang="postcss" module>
.avatar {
    width: 54px;
    height: 54px;
    margin-right: 10px;
    cursor: pointer;
    border: 3px solid #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
}

.selected {
    border-color: #e00;
    /* background: #fff; */
}
.btn {
    display: flex;
    align-items: center;
    font-weight: 700;
}

.divider {
    position: absolute;
    top: 28px;
    left: 0;
}
.preview {
    overflow: hidden;
    border: 1px solid #ccc;
    margin: 10px;
}
.model > div {
    min-width: 720px;

    @media (width <= 768px) {
        min-width: auto;
    }
}

.tip {
    font-size: responsive;
    margin: 10px 0;
}
.center {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
}
</style>

<style lang="postcss">
.avatar-upload {
    height: 100%;

    & .el-upload,
    & .el-upload-dragger {
        width: 100%;
        height: 100%;
        border-radius: 0;
    }
}
</style>