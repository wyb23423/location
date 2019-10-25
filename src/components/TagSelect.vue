<template>
    <el-select
        v-model="value"
        :remote-method="remoteMethod"
        placeholder="请输入标签名"
        @change="$emit('change', $event)"
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
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit } from 'vue-property-decorator';
import { Async } from '@/assets/utils/util';
import { ElOption } from 'element-ui/types/option';

@Component
export default class TagSelect extends Vue {
    public value: string = '';
    public tagOptions: Array<Pick<ElOption, 'value' | 'label'>> = [];
    private timer?: number;

    // 远程搜索标签数据
    public remoteMethod(key: string) {
        this.timer && clearTimeout(this.timer);
        if (!key) {
            return (this.tagOptions.length = 0);
        }

        this.timer = setTimeout(this.fetchTag.bind(this, key), 500);
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
}
</script>
