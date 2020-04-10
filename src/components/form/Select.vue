<template>
    <el-select
        :value="value"
        filterable
        default-first-option
        @change="change"
        :multiple="isMultiple"
        :disabled="isDisabled"
        :placeholder="placeholder"
        collapse-tags
    >
        <el-option label="--" :value="undefined" v-if="canEmpty"> </el-option>
        <el-option
            v-for="item of options"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        >
        </el-option>
    </el-select>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop, Model, Watch } from 'vue-property-decorator';

interface Option<T> {
    id?: T;
    name: string;
}

@Component
export default class Select extends Vue {
    @Model('input') public readonly value!: any;

    @Prop() public readonly url!: string;
    @Prop() public readonly multiple?: boolean;
    @Prop() public readonly disabled?: boolean;
    @Prop() public readonly placeholder?: string;

    @Prop({ default: () => false }) public readonly canEmpty?: boolean;
    @Prop({ default: () => ({}) }) public readonly filters!: IJson;
    @Prop({ default: () => ({ id: 'id', name: 'name' }) })
    public readonly keys!: Option<string>;

    public options: Array<Option<any>> = [];

    public get isMultiple() {
        return !(this.multiple == null || this.multiple === false);
    }

    public get isDisabled() {
        return !(this.disabled == null || this.disabled === false);
    }

    public created() {
        let currValue: number | string | Array<number | string> = this.value;
        this.isMultiple && (currValue = []);

        this.$http
            .get(this.url, {
                pageSize: 1000000,
                currentPage: 1,
                ...this.filters
            })
            .then(res => {
                this.options = res.pagedData.datas.map((v: any) => ({
                    id: v[this.keys.id || 'id'],
                    name: v[this.keys.name],
                    data: v
                }));

                if (!(currValue || this.canEmpty)) {
                    currValue =
                        this.value == null || this.value === ''
                            ? this.options[0].id
                            : this.value;
                }

                this.value !== currValue && this.change(currValue);
            })
            .catch(console.log);
    }

    public change(id: string | number | Array<string | number>) {
        this.$emit('input', id);

        if (!Array.isArray(id)) {
            id = [id];
        }
        this.$emit(
            'change',
            id.map(v => this.options.find(o => o.id === v))
        );
    }
}
</script>
