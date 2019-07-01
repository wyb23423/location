<template src="./add.html"></template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { ElForm } from 'element-ui/types/form';
import Select from '../../components/Select.vue';
import { State } from 'vuex-class/lib/bindings';

@Component({
    components: {
        'app-select': Select
    }
})
export default class PeopleAdd extends Vue {
    @State public baseUrl!: string;

    public url: string = ''; // 选择的图片
    public visible: boolean = false;
    public changeUpload: ((file: any) => void) | null = null; // 选择图片后回调

    // 预览图父div大小
    public previewBox: { width: string; height: string } = {
        width: '1024px',
        height: '1024px'
    };
    public preview: any = null; // 裁剪预览

    public form: any = {
        sex: 1,
        level: 'T1',
        type: 1,
        reason: '',
        avatar: ''
    };

    public created() {
        this.changeUpload = (file: any) => {
            if (
                file.raw.type !== 'image/png' &&
                file.raw.type !== 'image/jpeg'
            ) {
                return this.$message.error('只能上传jpg/png文件!');
            }

            if (file.size / 1024 / 1024 > 5) {
                return this.$message.error('上传文件大小不能超过 5MB!');
            }

            const reader = new FileReader();
            reader.onload = (e: ProgressEvent) => {
                // target.result 该属性表示目标对象的DataURL
                this.url = <string>(<FileReader>e.target).result;
            };
            // 传入一个参数对象即可得到基于该参数对象的文本内容
            reader.readAsDataURL(file.raw);
        };

        this.preview = {
            url: this.baseUrl + 'public/image/true.png',
            div: this.previewBox,
            w: 1024
        };
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
        cropper.getCropData((data: string) => {
            this.form.avatar = data;
            this.$message.success('设置成功');

            this.visible = false;
        });
    }

    public onSubmit() {
        const form = <ElForm>this.$refs.form;
        form.validate((valid: boolean) => {
            if (valid) {
                new Promise<any>(resolve => {
                    if (this.form.avatar) {
                        resolve(
                            this.$http.post('/api/tag/upload/tagPhoto', {
                                tagPhoto: this.form.avatar
                            })
                        );
                    } else {
                        resolve({ resultMap: { photoUrl: '' } });
                    }
                })
                    .then((res: ResponseData) => {
                        const now = Date.now();
                        const data = Object.assign(
                            {
                                createTime: now,
                                updateTime: now,
                                updateUser: 'string',
                                createUser: 'string',
                                locked: true,
                                photo: res.resultMap.photoUrl
                            },
                            this.form
                        );
                        data.avatar = '';

                        return this.$http.post('/api/tag/addTag', data, {
                            'Content-Type': 'application/json'
                        });
                    })
                    .then(() => {
                        this.$message.success('添加成功');
                        this.reset();
                    })
                    .catch(console.log);
            }
        });
    }

    public reset() {
        (<ElForm>this.$refs.form).resetFields();
        this.form.avatar = '';
    }
}
</script>

<style lang="postcss" module>
.avatar {
    width: 20%;
    cursor: pointer;
    border: 3px solid #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);

    @media (width <= 768px) {
        width: 75%;
    }
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

.preview {
    overflow: hidden;
    border: 1px solid #ccc;
    margin: 10px;
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

