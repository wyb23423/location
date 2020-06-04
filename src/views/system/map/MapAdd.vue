<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688; margin-bottom: 20px">
            地图添加
            <span style="font-size: 12px;">
                (注意: 如果地图文件是fengmap文件, 需将其对应的主题文件夹放入
                "/data/theme/" 目录)
            </span>
        </h3>
        <map-form @submit="onSubmit" ref="form" :loading="loading"></map-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import MapEdit, { MapForm } from '@/components/edit/MapEdit.vue';
import { Async } from '@/assets/utils/util';
import { UPLOAD_MAPFILE, ADD_MAP } from '@/constant/request';

@Component({
    components: {
        'map-form': MapEdit
    }
})
export default class MapAdd extends Vue {
    public loading = false;

    public async onSubmit(data: MapForm) {
        if (!data.map) {
            return;
        }

        this.loading = true;
        await this.fetch(data);

        // ======================================添加成功后的处理
        this.$message.success('添加成功');
        (<MapEdit>this.$refs.form).reset();

        this.loading = false;
    }

    @Async()
    private async fetch({ m0, m1, l0, l1, name, filename, map }: MapForm) {
        // ===========================上传文件
        const res = (await this.$http.post(UPLOAD_MAPFILE, {
            file: map,
            mapName: map?.name.split('.')[0] || 'map'
        })) as ResponseData<any, Record<'mapUrl', string>>;

        // ==============================提交数据
        const margin = [m0, m1, l0, l1].map(v => [v.x, v.y]);
        filename || margin.splice(0, 2);

        return this.$http.post({
            url: ADD_MAP,
            body: {
                name,
                filepath: res.resultMap.mapUrl,
                margin: JSON.stringify(margin)
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
</script>
 