<template>
    <el-select
        ref="form"
        v-model="value"
        :remote-method="remoteMethod"
        :placeholder="placeholder"
        @change="$emit('change', $event)"
        :multiple="multiple"
        :multiple-limit="5"
        :loading="loading"
        :disabled="disabled"
        remote
        filterable
        collapse-tags
        reserve-keyword
    >
        <el-option
            v-for="item in tagOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        >
        </el-option>
    </el-select>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop, Ref } from 'vue-property-decorator';
import { Async } from '@/assets/utils/util';
import { ElOption } from 'element-ui/types/option';
import { ElSelect } from 'element-ui/types/select';

@Component
export default class TagSelect extends Vue {
    @Prop({ default: () => false }) public readonly disabled!: boolean;
    @Prop({ default: () => false }) public readonly multiple!: boolean;
    @Prop({ default: () => '请输入标签名' })
    public readonly placeholder!: string;

    public value: string | string[] = '';
    public tagOptions: Array<Pick<ElOption, 'value' | 'label'>> = [];
    public loading: boolean = false;

    @Ref('form') private readonly elSelect!: ElSelect;
    private timer?: number;

    public created() {
        this.multiple && (this.value = []);
    }

    // 远程搜索标签数据
    public remoteMethod(key: string) {
        this.timer && clearTimeout(this.timer);
        if (!key) {
            return (this.tagOptions = []);
        }

        this.timer = setTimeout(async () => {
            const arr = await this.fetchTag(key);
            this.loading = false;

            this.$nextTick(() => arr && (this.tagOptions = arr));
        }, 500);
    }

    @Async()
    private async fetchTag(key: string) {
        this.loading = true;
        const res = await this.$http.get('/api/tag/getall', {
            pageSize: 100,
            currentPage: 1,
            name: key
        });

        this.$emit('remote', res.pagedData.datas);
        return res.pagedData.datas.map((v: ITag) => ({
            label: v.name,
            value: v.id
        }));
    }
}
</script>
