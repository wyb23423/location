<template>
    <div style="padding-left: 5%; padding-top: 3%">
        <h3 style="color: #009688; margin-bottom: 20px">地图添加</h3>
        <map-form @submit="onSubmit" ref="form" :loading="loading"></map-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import MapEdit, { MapForm } from '@/components/edit/MapEdit.vue';
import { Async } from '@/assets/utils/util';
import { UPLOAD_MAPFILE, ADD_MAP } from '@/constant/request';
import { Message } from 'element-ui';

@Component({
    components: {
        'map-form': MapEdit,
    },
})
export default class MapAdd extends Vue {
    public loading = false;

    public async onSubmit(data: MapForm, filepath: string) {
        if (!data.map) {
            return;
        }

        this.loading = true;
        const sucess = await this.fetch(data, filepath);

        // ======================================添加成功后的处理
        if (sucess) {
            this.$message.success('添加成功');
            (<MapEdit>this.$refs.form).reset();
        }

        this.loading = false;
    }

    @Async()
    private async fetch({ m0, m1, l0, l1, name, filename }: MapForm, filepath: string) {
        // ==============================提交数据
        const margin = [m0, m1, l0, l1].map((v) => [v.x, v.y]);
        filename || margin.splice(0, 2);

        return this.$http.post({
            url: ADD_MAP,
            body: {
                name,
                filepath,
                margin: JSON.stringify(margin),
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
</script>
 