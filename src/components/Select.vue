<template>
    <el-select
        v-model="currValue"
        filterable
        default-first-option
        @change="change"
        :multiple="!!multiple"
        collapse-tags
    >
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
import { Emit, Prop } from 'vue-property-decorator';

interface Option<T> {
    id: T;
    name: string;
}

@Component
export default class Select extends Vue {
    @Prop() public url!: string;
    @Prop() public value!: any;
    @Prop({
        default: () => ({ id: 'id', name: 'name' })
    })
    public keys!: Option<string>;
    @Prop() public multiple?: boolean;

    public options: Array<Option<any>> = [];
    public currValue: any = null;

    public created() {
        this.$http
            .get(this.url, {
                pageSize: 1000000,
                currentPage: 1
            })
            .then(res => {
                this.options = res.pagedData.datas.map((v: any) => ({
                    id: v[this.keys.id],
                    name: v[this.keys.name]
                }));

                if (this.multiple) {
                    this.currValue = [];
                } else {
                    this.currValue =
                        this.value == null || this.value === ''
                            ? this.options[0].id
                            : this.value;
                }

                this.change(this.currValue);
            })
            .catch(console.error);
    }

    @Emit('input')
    public change(id: any) {
        this.$emit('change', id);
    }
}
</script>

<style lang="postcss" module>
</style>