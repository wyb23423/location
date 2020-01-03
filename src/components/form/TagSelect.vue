<template>
    <el-select
        ref="form"
        v-model="value"
        :remote-method="remoteMethod"
        :placeholder="placeholder"
        @change="change"
        :multiple="multiple"
        :multiple-limit="multipleLimit"
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
            :disabled="item.disabled"
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
import { GET_TAG } from '@/constant/request';

type Option = Pick<ElOption, 'label' | 'value' | 'disabled'>;

@Component
export default class TagSelect extends Vue {
    @Prop({ default: () => false }) public readonly disabled!: boolean;
    @Prop({ default: () => false }) public readonly multiple!: boolean;
    @Prop({ default: () => 5 }) public readonly multipleLimit!: number | null;
    @Prop({ default: () => '请输入标签名' })
    public readonly placeholder!: string;
    @Prop({ default: () => () => true })
    public readonly isValid!: (data: ITag) => boolean;

    public value: string | string[] = '';
    public tagOptions: Option[] = [];
    public loading: boolean = false;

    @Ref('form') private readonly elSelect!: ElSelect;
    private timer?: number;
    private id2data = new Map<string, ITag>();

    public created() {
        this.multiple && (this.value = []);
    }

    public change(data: string | string[]) {
        this.$emit(
            'change',
            data,
            Array.isArray(data)
                ? data.map(v => this.id2data.get(v))
                : this.id2data.get(data)
        );
    }

    public reset() {
        this.tagOptions.length = 0;
        this.value = this.multiple ? [] : '';
    }

    public setValue(data: string | string[]) {
        const isArr = Array.isArray(data);
        if (this.multiple && !isArr) {
            return console.error('data is not a array');
        }

        if (!this.multiple && isArr) {
            return console.error('data is not a string');
        }

        this.value = data;
        if (data && (!Array.isArray(data) || data.length)) {
            this.fetchTag().then(() => (this.loading = false));
        }
    }

    // 远程搜索标签数据
    public remoteMethod(key: string) {
        this.timer && clearTimeout(this.timer);
        if (!key) {
            return (this.tagOptions = this.filter());
        }

        this.timer = setTimeout(
            () => this.fetchTag(key).then(() => (this.loading = false)),
            500
        );
    }

    private filter() {
        const arr: Option[] = [];
        for (const v of this.tagOptions) {
            if (this.multiple) {
                this.value.includes(v.value) && arr.push(v);
            } else if (v.value === this.value) {
                arr.push(v);
                break;
            }
        }
        this.tagOptions = [];

        return arr;
    }

    @Async()
    private async fetchTag(key?: string) {
        this.loading = true;
        const res = await this.$http.get(GET_TAG, {
            pageSize: 100000,
            currentPage: 1,
            name: key
        });

        this.$emit('remote', res.pagedData.datas);

        const arr = this.filter();
        res.pagedData.datas.forEach((v: ITag) => {
            if (!key || v.name.includes(key)) {
                this.id2data.set(v.tagNo, v);
                if (!arr.find(t => t.value === v.id)) {
                    arr.push({
                        label: v.name,
                        value: v.tagNo,
                        disabled: !this.isValid(v)
                    });
                }
            }
        });

        this.$nextTick(() => (this.tagOptions = arr));
    }
}
</script>
