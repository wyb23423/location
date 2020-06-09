<template>
    <div>
        <el-button
            size="small"
            type="primary"
            icon="el-icon-folder-add"
            @click="visible = true"
        >
            选择文件
        </el-button>
        <div style="ont-size: 0.75rem;color: #606266;margin-top: 0.4375rem;">
            {{ files.length }}个文件
        </div>

        <el-dialog title="上传主题文件" :visible.sync="visible" width="70%">
            <div class="flex-center" style="width: 80%">
                <el-upload
                    accept=".fmi,.theme"
                    :auto-upload="false"
                    action=""
                    :on-remove="remove"
                    :on-change="change"
                    multiple
                    drag
                >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                    </div>
                    <div slot="tip" class="el-upload__tip">
                        只能上传fmi/theme文件!
                    </div>
                </el-upload>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { ElUploadInternalFileDetail } from 'element-ui/types/upload';
import HTTP from '@/assets/lib/http';
import { UPLOAD_FILES } from '@/constant/request';

@Component
export default class Theme extends Vue {
    public visible: boolean = false;
    public files: File[] = [];

    public change({ raw }: ElUploadInternalFileDetail) {
        this.files.push(raw);
    }

    public remove(file: ElUploadInternalFileDetail) {
        const index = this.files.indexOf(file.raw);
        index > -1 && this.files.splice(index, 1);
    }

    public upload() {
        if (!this.files.length) {
            this.$message.warning('主题文件不能为空');
            return;
        }

        const fromData = new FormData();
        for (const v of this.files) {
            if (!(v.name.endsWith('.fmi') || v.name.endsWith('.theme'))) {
                this.$message.error('只能上传fmi/theme文件!');
                return;
            }

            fromData.append('files', v);
        }

        return this.$http.post(UPLOAD_FILES, fromData);
    }
}
</script>