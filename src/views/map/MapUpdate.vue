<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">
            地图编辑
        </h3>
        <el-form inline>
            <el-form-item label="选择地图">
                <map-select @selectmap="selectMap"></map-select>
            </el-form-item>
            <el-form-item>
                <el-button
                    type="danger"
                    icon="el-icon-delete"
                    @click="del"
                    v-if="!!permission.delete"
                >
                    删除
                </el-button>
            </el-form-item>
        </el-form>
        <div
            class="el-divider el-divider--horizontal"
            style="width: 95%;background-color: #e00;"
        ></div>
        <map-form
            @submit="onSubmit"
            :data.sync="map"
            v-if="!!permission.put"
        ></map-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import MapEdit from '@/components/MapEdit.vue';
import MapSelect from '@/components/MapSelect.vue';
import { Prop } from 'vue-property-decorator';

@Component({
    components: {
        'map-form': MapEdit,
        'map-select': MapSelect
    }
})
export default class MapAdd extends Vue {
    @Prop() public permission!: Permission;

    public map: IJson = {};

    public selectMap(data: IMap) {
        const margin = <number[][]>data.margin;

        this.map = {
            id: data.id,
            name: data.name,
            minX: margin[0][0],
            maxX: margin[2][0],
            minY: margin[0][1],
            maxY: margin[2][1],
            width: margin[4][0],
            height: margin[4][1],
            [data.filepath.endsWith('.fmap')
                ? 'filename'
                : 'url']: data.filepath
        };
    }

    public del() {
        if (this.map.id != null) {
            this.$confirm(`删除地图: ${this.map.name}?`)
                .then(() =>
                    this.$http.post('/api/map/deleteMap', { id: this.map.id })
                )
                .then(() => {
                    this.$message.success('删除成功');
                    location.href = location.href;
                })
                .catch(console.log);
        } else {
            this.$message.error('未选择地图!');
        }
    }

    public onSubmit(data: IJson) {
        if (this.map.id == null) {
            return this.$message.error('未选择地图!');
        }

        this.$confirm('确认修改?')
            .then((): any => {
                if (data.map) {
                    return this.$http.post('/api/map/upload/mapfile', {
                        file: data.map,
                        mapName: data.map.name.split('.')[0] || 'map'
                    });
                }

                return { resultMap: { mapUrl: data.filename || data.url } };
            })
            .then((res: { resultMap: { mapUrl: string } }) => {
                const timestamp = Date.now();
                const { minX, maxX, minY, maxY } = data;

                return this.$http.post({
                    url: '/api/map/updateMap',
                    body: {
                        id: this.map.id,
                        filepath: res.resultMap.mapUrl,
                        name: data.name,
                        updateTime: timestamp,
                        updateUser: 'null',
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
            .then(() => this.$message.success('修改成功'))
            .catch(console.log);
    }
}
</script>
 