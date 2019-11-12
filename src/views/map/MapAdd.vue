<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">
            地图添加
            <span style="font-size: 12px;">
                (注意: 如果地图文件是fengmap文件, 需将其对应的主题文件夹放入
                "/data/theme/" 目录)
            </span>
        </h3>
        <map-form @submit="onSubmit" ref="form"></map-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import MapEdit from '@/components/edit/MapEdit.vue';

@Component({
    components: {
        'map-form': MapEdit
    }
})
export default class MapAdd extends Vue {
    public onSubmit(data: any) {
        this.$http
            .post('/api/map/upload/mapfile', {
                file: data.map,
                mapName: data.map.name.split('.')[0] || 'map'
            })
            .then((res: ResponseData) => {
                const { minX, maxX, minY, maxY } = data;

                return this.$http.post({
                    url: '/api/map/addMap',
                    body: {
                        filepath: res.resultMap.mapUrl,
                        name: data.name,
                        groupCode: JSON.stringify(data.groupCode),
                        margin: JSON.stringify([
                            [minX, minY],
                            [minX, maxY],
                            [maxX, maxY],
                            [maxX, minY],
                            [data.width, data.height]
                        ])
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            })
            .then(() => {
                this.$message.success('添加成功');
                (<MapEdit>this.$refs.form).reset();
            })
            .catch(console.log);
    }
}
</script>
 