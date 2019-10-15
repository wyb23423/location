<template>
    <div style="padding: 5%">
        <h3 style="color: rgb(0, 150, 136)">标签触发报警的区域</h3>
        <el-form :model="form" label-width="auto">
            <el-form-item label="相关标签">
                <el-select
                    v-model="form.tagId"
                    :remote-method="remoteMethod"
                    placeholder="请输入标签名"
                    @change="change"
                    style="min-width: 200px"
                    remote
                    filterable
                >
                    <el-option
                        v-for="item in tagOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="区域">
                <el-transfer
                    v-model="form.zoneIds"
                    :data="zones"
                    :titles="['区域列表', '已选择']"
                ></el-transfer>
            </el-form-item>
            <el-form-item>
                <el-button
                    type="success"
                    @click="submit"
                    :disabled="!(this.form.tagId && this.form.zoneIds.length)"
                >
                    立即提交
                </el-button>
                <el-button
                    type="danger"
                    @click="remove"
                    v-if="isUpdate"
                    icon="el-icon-delete"
                >
                    删除
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import { ZoneMode } from '@/store';
import { ElSelect } from 'element-ui/types/select';
import { ElOption } from 'element-ui/types/option';
import { Async } from '@/assets/utils/await';
import { TransferData } from 'element-ui/types/transfer';

@Component
export default class TagZone extends Vue {
    @State public zoneMode!: ZoneMode;

    public form = {
        tagId: '',
        zoneIds: <number[]>[]
    };
    public tagOptions: Array<Pick<ElOption, 'value' | 'label'>> = [];
    public isUpdate: boolean = false;
    public zones: TransferData[] = [];

    private timer?: number;

    @Async()
    public async created() {
        const res = await this.$http.get('/api/zone/getall', {
            currentPage: 1,
            pageSize: 1000
        });

        res.pagedData.datas.forEach((v: IZone) => {
            if (v.mode === this.zoneMode.in || v.mode === this.zoneMode.out) {
                this.zones.push({
                    label: v.name,
                    key: v.id,
                    disabled: false
                });
            }
        });
    }

    public remoteMethod(key: string) {
        this.timer && clearTimeout(this.timer);
        if (!key) {
            return (this.tagOptions.length = 0);
        }

        this.timer = setTimeout(this.fetchTag.bind(this, key), 500);
    }

    public async change() {
        this.isUpdate = !!(await this.fetchTagZone(this.form.tagId));
        this.$http.showMessage = true;
    }

    @Async()
    public async submit() {
        const path = this.isUpdate ? 'updateTagZone' : 'addTagZone';
        await this.$http.post('/api/tagZone/' + path, this.form);
        this.success('操作成功');
    }

    @Async()
    public async remove() {
        await this.$http.post('/api/tagZone/deleteTagZone', this.form);
        this.success('删除成功');
    }

    private success(msg: string) {
        this.$message.success(msg);
        this.form = {
            tagId: '',
            zoneIds: []
        };
    }

    @Async()
    private async fetchTag(key: string) {
        const res = await this.$http.get('/api/tag/getall', {
            pageSize: 100,
            currentPage: 1,
            name: key
        });

        this.tagOptions = res.pagedData.datas.map((v: ITag) => ({
            label: v.name,
            value: v.id
        }));
    }

    @Async()
    private async fetchTagZone(tagId: string) {
        this.$http.showMessage = false;

        const res = await this.$http.get('/api/tagZone/getTagZone', { tagId });
        this.form.zoneIds = res.resultMap.zones.map((v: IZone) => v.id);

        return true;
    }
}
</script>