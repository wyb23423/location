<template>
    <div style="padding: 5%">
        <h3 style="color: rgb(0, 150, 136)">标签触发报警的区域</h3>
        <el-form :model="form" label-width="auto">
            <el-form-item label="相关标签">
                <tag-select
                    style="min-width: 200px"
                    @change="change"
                ></tag-select>
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
                    :icon="isUpdate ? 'el-icon-refresh' : 'el-icon-plus'"
                >
                    {{ isUpdate ? '更新' : '添加' }}
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
import TagSelect from '@/components/form/TagSelect.vue';

@Component({
    components: {
        'tag-select': TagSelect
    }
})
export default class TagZone extends Vue {
    @State public zoneMode!: ZoneMode;

    public form = {
        tagId: '',
        zoneIds: <number[]>[]
    };
    public tagOptions: Array<Pick<ElOption, 'value' | 'label'>> = [];
    public isUpdate: boolean = false;
    public zones: TransferData[] = [];

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

    // 选中的标签变化
    public async change(value: string) {
        this.form.tagId = value;
        this.isUpdate = !!(await this.fetchTagZone(this.form.tagId));
        this.$http.showMessage = true;
    }

    // 更新/添加
    @Async()
    public async submit() {
        const path = this.isUpdate ? 'updateTagZone' : 'addTagZone';
        await this.$http.post('/api/tagZone/' + path, this.form);

        this.success(this.isUpdate ? '更新成功' : '添加成功');
    }

    // 删除
    @Async()
    public async remove() {
        await this.$http.post('/api/tagZone/deleteTagZone', {
            tagId: this.form.tagId
        });

        this.success('删除成功');
    }

    // 操作成功回调
    private success(msg: string) {
        this.$message.success(msg);
        this.form = {
            tagId: '',
            zoneIds: []
        };
    }

    // 获取tagZone数据
    @Async()
    private async fetchTagZone(tagId: string) {
        this.$http.showMessage = false;

        const res = await this.$http.get('/api/tagZone/getTagZone', { tagId });
        this.form.zoneIds = res.resultMap.zones.map((v: IZone) => v.id);

        return true;
    }
}
</script>