<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">
            地图编辑
        </h3>
        <el-form inline>
            <el-form-item label="选择地图">
                <map-select @selectmap="selectMap" ref="mapSelect"></map-select>
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
            :loading="loading"
            v-if="!!permission.post"
        ></map-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import MapEdit, { MapForm } from '@/components/edit/MapEdit.vue';
import MapSelect from '@/components/form/MapSelect.vue';
import { Prop, Ref } from 'vue-property-decorator';
import { Async } from '@/assets/utils/util';
import { RM_MAP, UPLOAD_MAPFILE, UPDATE_MAP } from '@/constant/request';
import { Vector } from '../../assets/map/transform/vector';
import { Loading } from '@/mixins/loading';

@Component({
    components: {
        'map-form': MapEdit,
        'map-select': MapSelect
    }
})
export default class MapUpdate extends Vue {
    @Prop() public permission!: Permission;

    public map: MapForm = Object.create(null);
    public loading: boolean = false;

    @Ref('mapSelect') private readonly mapSelect!: MapSelect;

    public selectMap(data: IMap) {
        const margin = [...data.margin];

        const isFengMap = data.filepath.endsWith('.fmap');
        isFengMap || margin.unshift([0, 0], [0, 0]);
        this.map = {
            id: data.id,
            name: data.name,
            m0: Vector.create(margin[0]),
            m1: Vector.create(margin[1]),
            l0: Vector.create(margin[2]),
            l1: Vector.create(margin[3]),
            [isFengMap ? 'filename' : 'url']: data.filepath
        };
    }

    @Async()
    public async del() {
        if (this.map.id == null) {
            return this.$message.error('未选择地图!');
        }

        await this.$confirm(`删除地图: ${this.map.name}?`);
        await this.$http.post(RM_MAP, { id: this.map.id });

        this.$message.success('删除成功');
        this.mapSelect.getMapData(true);
    }

    @Async()
    public async onSubmit(data: MapForm) {
        const id = this.map.id;
        if (id == null) {
            return this.$message.error('未选择地图!');
        }
        await this.$confirm('确认修改地图数据?');

        this.loading = true;

        // ======================================
        let filepath = data.filename || data.url;
        if (data.map) {
            const res = (await this.$http.post(UPLOAD_MAPFILE, {
                file: data.map,
                mapName: data.map.name.split('.')[0] || 'map'
            })) as ResponseData<any, Record<'mapUrl', string>>;
            filepath = res.resultMap.mapUrl;
        }
        // ===========================================
        const { m0, m1, l0, l1, name, url, filename } = data;
        const margin = [m0, m1, l0, l1].map(v => [v.x, v.y]);
        data.filename || margin.splice(0, 2);
        await this.$http.post({
            url: UPDATE_MAP,
            body: {
                id,
                name,
                filepath,
                margin: JSON.stringify(margin)
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // ====================================
        this.$message.success('修改成功');
        await this.mapSelect.getMapData();

        this.loading = false;
    }
}
</script>
 