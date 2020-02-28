<template>
    <el-form label-width="auto" :model="form" ref="form">
        <el-form-item label="地图名称" prop="name" required>
            <el-input
                v-model="form.name"
                style="width: 50%"
                placeholder="请输入地图名称"
            ></el-input>
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
        <el-divider content-position="left" class="map-edit-divider">
            定位坐标
        </el-divider>
        <el-form-item label="左下角" required>
            <el-form-item :class="$style.inline" required prop="l0.x">
                <el-input-number
                    :step="100"
                    v-model="form.l0.x"
                    placeholder="x"
                ></el-input-number>
            </el-form-item>
            <el-form-item prop="l0.y" required :class="$style.inline">
                <el-input-number
                    :step="100"
                    v-model="form.l0.y"
                    placeholder="y"
                ></el-input-number>
            </el-form-item>
        </el-form-item>
        <el-form-item label="右上角" required>
            <el-form-item :class="$style.inline" required prop="l1.x">
                <el-input-number
                    :step="100"
                    v-model="form.l1.x"
                    placeholder="x"
                ></el-input-number>
            </el-form-item>
            <el-form-item prop="l1.y" required :class="$style.inline">
                <el-input-number
                    :step="100"
                    v-model="form.l1.y"
                    placeholder="y"
                ></el-input-number>
            </el-form-item>
        </el-form-item>
        <template v-if="!!form.filename">
            <el-divider content-position="left" class="map-edit-divider">
                地图坐标
            </el-divider>
            <el-form-item label="左下角" required>
                <el-form-item :class="$style.inline" required prop="m0.x">
                    <el-input-number
                        :step="100"
                        v-model="form.m0.x"
                        placeholder="x"
                    ></el-input-number>
                </el-form-item>
                <el-form-item prop="m0.y" required :class="$style.inline">
                    <el-input-number
                        :step="100"
                        v-model="form.m0.y"
                        placeholder="y"
                    ></el-input-number>
                </el-form-item>
            </el-form-item>
            <el-form-item label="右上角" required>
                <el-form-item :class="$style.inline" required prop="m1.x">
                    <el-input-number
                        :step="100"
                        v-model="form.m1.x"
                        placeholder="x"
                    ></el-input-number>
                </el-form-item>
                <el-form-item prop="m1.y" required :class="$style.inline">
                    <el-input-number
                        :step="100"
                        v-model="form.m1.y"
                        placeholder="y"
                    ></el-input-number>
                </el-form-item>
            </el-form-item>
        </template>
        <el-form-item>
            <el-button
                type="success"
                @click="submit"
                :loading="loading"
                :disabled="loading"
            >
                立即提交
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch, Emit, Ref } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { ElUploadInternalFileDetail } from 'element-ui/types/upload';
import { Async } from '@/assets/utils/util';

export interface MapForm {
    id?: number;
    name: string;

    // 地图上的两个坐标点(左下、右上)
    m0: Vector2;
    m1: Vector2;
    // 定位坐标
    l0: Vector2;
    l1: Vector2;

    filename?: string;
    url?: string;
    map?: File;
}

@Component
export default class MapEdit extends Vue {
    @Prop({ default: () => false }) public loading!: boolean;
    @Prop({ default: () => ({}) }) public data!: MapForm;

    public form = <MapForm>{
        url: '',
        filename: '',
        m0: {},
        m1: {},
        l0: {},
        l1: {},
        name: ''
    };

    @Ref('form') private readonly elFrom!: ElForm;

    public changeUpload({ raw, name, size }: ElUploadInternalFileDetail) {
        if (
            !(
                raw.type === 'image/png' ||
                raw.type === 'image/jpeg' ||
                name.endsWith('.fmap')
            )
        ) {
            return this.$message.error('只能上传jpg/png/fmap文件!');
        }

        if (size / 1024 / 1024 > 5) {
            return this.$message.error('上传文件大小不能超过 5MB!');
        }

        this.form.url && URL.revokeObjectURL(this.form.url);
        Object.assign(
            this.form,
            { map: raw },
            name.endsWith('.fmap')
                ? { filename: name, url: '' }
                : { filename: '', url: URL.createObjectURL(raw) }
        );
    }

    @Async()
    public async submit() {
        await this.elFrom.validate();

        if (!(this.form.map || this.form.url || this.form.filename)) {
            return this.$message.warning('地图文件不能为空');
        }

        this.$emit('update:data', this.form);
        this.$emit('submit', this.form);
    }

    @Emit('update:data')
    public reset() {
        this.elFrom.resetFields();
        this.form.map = void 0;
        this.form.url = this.form.filename = '';

        return this.form;
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

    &:last-child {
        margin-left: 20px;
    }
}
</style>

<style lang="postcss">
.map-edit-divider {
    background-color: #b2b8c5;
    width: 80%;
    margin: 30px 0 20px;

    & .el-divider__text {
        background-color: #e2e2e2;
    }
}
</style>