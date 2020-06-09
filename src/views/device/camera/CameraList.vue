<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="op"
                :op-width="120"
                @del="del"
                @setting="camera = $event"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>

        <template v-if="!!camera">
            <el-dialog
                title="更改摄像头"
                :visible="true"
                :modal-append-to-body="false"
                width="80%"
                @close="camera = null"
            >
                <camera-form :form="camera" method="POST"></camera-form>
            </el-dialog>
        </template>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import TableMixin from '../../../mixins/table';
import { Async } from '@/assets/utils/util';
import { REQUEST_CAMERA, GET_CAMERA } from '@/constant/request';
import CameraAdd from './CameraAdd.vue';

@Component({
    components: {
        'camera-form': CameraAdd
    }
})
export default class CameraList extends TableMixin {
    public camera: ICamera | null = null;
    public tableData!: ICamera[];
    public colCfg = [
        { prop: 'id', label: '摄像头ID', sortable: true, width: 140 },
        { prop: 'groupId', label: '所属组号', sortable: true, width: 170 },
        { prop: 'url', label: '取流地址', width: 333 }
    ];

    public get op() {
        const btn = [];
        if (this.permission?.delete) {
            btn.push({ type: 'danger', name: 'del', desc: '删除' });
        }

        if (this.permission?.post) {
            btn.push({ type: 'primary', name: 'setting', desc: '编辑' });
        }

        return btn;
    }

    @Async()
    public async del({ id }: ICamera) {
        await this.$confirm(`删除摄像头${id}?`);
        await this.$http.request({
            url: REQUEST_CAMERA,
            method: 'DELETE',
            params: { id }
        });

        this.refresh().$message.success('删除成功');
    }

    protected async fetch(page: number, pageSize: number) {
        let data: ICamera[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get(GET_CAMERA, {
                pageSize,
                currentPage: page
            });

            data = res.pagedData.datas.map(v => {
                if (v.description) {
                    v.description = JSON.parse(v.description);
                } else {
                    v.description = {};
                }

                return v;
            });
            count = res.pagedData.totalCount;
        } catch (e) {
            console.log(e);
        }

        return { count, data };
    }
}
</script>

