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
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import TableMixin from '../../../mixins/table';
import { RM_CAMERA, GET_CAMERA } from '@/constant/request';
import { Async } from '@/assets/utils/util';

@Component
export default class CameraList extends TableMixin {
    @State public baseUrl!: string;

    public tableData!: ICamera[];
    public colCfg = [
        { prop: 'id', label: '摄像头ID', sortable: true, width: 140 },
        { prop: 'groupId', label: '所属组号', sortable: true, width: 170 },
        { prop: 'url', label: '取流地址', width: 333 }
    ];

    @Async()
    public async del({ id }: ICamera) {
        await this.$confirm(`删除摄像头${id}?`);
        await this.$http.post(RM_CAMERA, { id });
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

            data = res.pagedData.datas;
            count = res.pagedData.totalCount;
        } catch (e) {
            console.log(e);
        }

        return { count, data };
    }
}
</script>

