<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">
            地图编辑
        </h3>
        <el-form>
            <el-form-item label="选择地图">
                <map-select @selectmap="selectMap"></map-select>
            </el-form-item>
        </el-form>
        <div
            class="el-divider el-divider--horizontal"
            style="width: 95%;background-color: #e00;"
        ></div>
        <map-form @submit="onSubmit" :data.sync="map"></map-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import MapEdit from '@/components/MapEdit.vue';
import MapSelect from '@/components/MapSelect.vue';

@Component({
    components: {
        'map-form': MapEdit,
        'map-select': MapSelect
    }
})
export default class MapAdd extends Vue {
    public map: IJson = {};

    public selectMap(data: IMap) {
        const margin = <number[][]>data.margin;

        this.map = {
            name: data.name,
            minX: margin[0][0],
            maxX: margin[2][0],
            minY: margin[0][1],
            maxY: margin[2][1],
            [data.filepath.endsWith('.fmap')
                ? 'filename'
                : 'url']: data.filepath
        };
    }

    public onSubmit(data: IJson) {
        this.$confirm('确认修改?')
            .then(
                (): any => {
                    if (data.map) {
                        return this.$http.post('/api/map/upload/mapfile', {
                            file: data.map,
                            mapName: data.map.name.split('.')[0] || 'map'
                        });
                    }

                    return { resultMap: { mapUrl: data.filename || data.url } };
                }
            )
            .then((res: { resultMap: { mapUrl: string } }) => {
                const timestamp = Date.now();
                const { minX, maxX, minY, maxY } = data;

                return this.$http.post({
                    url: '/api/map/addMap',
                    body: {
                        ...this.map,
                        filepath: res.resultMap.mapUrl,
                        name: data.name,
                        updateTime: timestamp,
                        updateUser: 'null',
                        margin: JSON.stringify([
                            [minX, minY],
                            [minX, maxY],
                            [maxX, maxY],
                            [maxX, minY]
                        ])
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            })
            .then(() => {
                this.$message.success('修改成功');
                (<MapEdit>this.$refs.form).reset();
            })
            .catch(console.log);
    }
}
</script>
 