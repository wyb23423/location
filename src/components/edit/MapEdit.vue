<template>
    <el-form label-width="auto" :model="form" ref="form">
        <el-form-item label="地图名称" prop="name" required>
            <el-input
                v-model="form.name"
                style="width: 50%"
                placeholder="请输入地图名称"
            ></el-input>
        </el-form-item>
        <el-form-item
            v-for="k of ['minX', 'maxX', 'minY', 'maxY']"
            :key="k"
            :label="k"
            :prop="k"
            required
        >
            <el-input-number
                :step="100"
                v-model="form[k]"
                placeholder="地图坐标"
            ></el-input-number>
        </el-form-item>
        <el-form-item label="地图大小" required>
            <el-form-item required :class="$style.inline" prop="width">
                <el-input-number
                    :step="100"
                    v-model="form.width"
                    placeholder="宽(定位)"
                ></el-input-number>
            </el-form-item>
            <el-form-item
                required
                :class="$style.inline"
                style="margin-left: 20px"
                prop="height"
            >
                <el-input-number
                    :step="100"
                    v-model="form.height"
                    placeholder="高(定位)"
                ></el-input-number>
            </el-form-item>
        </el-form-item>

        <el-form-item required label="地图">
            <el-upload
                :auto-upload="false"
                action=""
                :show-file-list="false"
                :on-change="changeUpload"
            >
                <el-button size="small" type="success" icon="el-icon-upload">
                    选择文件
                </el-button>
                <div slot="tip" class="el-upload__tip">
                    <img v-if="form.url" :src="form.url" :class="$style.img" />
                    <template v-else>
                        {{
                            form.filename ||
                                '只能上传jpg/png/fmp文件，且不超过5M'
                        }}
                    </template>
                </div>
            </el-upload>
        </el-form-item>
        <el-form-item>
            <el-button type="success" @click="submit">立即提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch, Emit } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { ElUploadInternalFileDetail } from 'element-ui/types/upload';

export interface MapForm {
    id: number;
    name: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
    filename?: string;
    url?: string;
    map?: File | null;
}

@Component
export default class MapEdit extends Vue {
    @Prop({ default: () => ({}) }) public data!: MapForm;

    public form = <MapForm>{
        url: '',
        filename: '',
        map: null,
        name: ''
    };

    public changeUpload(file: ElUploadInternalFileDetail) {
        if (
            file.raw.type !== 'image/png' &&
            file.raw.type !== 'image/jpeg' &&
            !file.name.endsWith('.fmap')
        ) {
            return this.$message.error('只能上传jpg/png/fmag文件!');
        }

        if (file.size / 1024 / 1024 > 5) {
            return this.$message.error('上传文件大小不能超过 5MB!');
        }

        this.form.url && URL.revokeObjectURL(this.form.url);
        if (file.name.endsWith('.fmap')) {
            this.form.url = '';
            this.form.filename = file.name;
        } else {
            // const reader = new FileReader();
            // reader.onload = (e: ProgressEvent) => {
            //     this.form.filename = '';
            //     // target.result 该属性表示目标对象的DataURL
            //     this.form.url = <string>(<FileReader>e.target).result;
            // };
            // // 传入一个参数对象即可得到基于该参数对象的文本内容
            // reader.readAsDataURL(file.raw);

            this.form.filename = '';
            this.form.url = URL.createObjectURL(file.raw);
        }

        this.form.map = file.raw;
    }

    public submit() {
        const form = <ElForm>this.$refs.form;

        form.validate()
            .then(() => {
                if (!(this.form.map || this.form.url || this.form.filename)) {
                    return this.$message.warning('地图文件不能为空');
                }

                this.$emit('update:data', this.form);
                this.$emit('submit', this.form);
            })
            .catch(console.log);
    }

    @Emit('update:data')
    public reset() {
        (<ElForm>this.$refs.form).resetFields();
        this.form.map = null;
        this.form.url = this.form.filename = '';

        return {};
    }

    @Watch('data')
    public assignForm() {
        this.form = { ...this.data };
    }
}
</script>

<style lang="postcss" module>
.img {
    max-width: 60%;
    max-height: 400px;
}

.inline {
    display: inline-block;
    vertical-align: middle;
}
</style>

