<template>
    <div style="padding: 5%; height: 100%" v-if="!base">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[
                    { type: 'success', name: 'look', desc: '查看详情' },
                    { type: 'danger', name: 'del', desc: '删除' }
                ]"
                :op-width="200"
                @del="del"
                @look="look"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>
    </div>

    <div v-else :class="$style.info">
        <el-page-header
            @back="look(null)"
            style="margin-bottom: 20px"
        ></el-page-header>

        <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="设备信息" name="info">
                <base-info :data="base"></base-info>
            </el-tab-pane>
            <!-- <el-tab-pane label="基本属性设置" name="primary">
                <base-primary></base-primary>
            </el-tab-pane>
            <el-tab-pane label="网络参数设置" name="net">
                <base-net></base-net>
            </el-tab-pane> -->
            <el-tab-pane label="位置设置" name="position">
                <base-position :data="base"></base-position>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import BaseInfo from '../../components/base/BaseInfo.vue';
import Primary from '../../components/base/Primary.vue';
import Net from '../../components/base/Net.vue';
import Position from '../../components/base/Position.vue';
import * as http from '../../assets/utils/http';

@Component({
    components: {
        'base-info': BaseInfo,
        'base-primary': Primary,
        'base-net': Net,
        'base-position': Position
    }
})
export default class Info extends mixins(TableMixin) {
    public colCfg: any[] = [
        { prop: 'id', label: '基站ID', sortable: true, width: 150 },
        { prop: 'baseNo', label: '基站编号', width: 175 },
        { prop: 'name', label: '基站名称', width: 175 },
        { prop: 'main', label: '主基站', width: 145 },
        { prop: 'zone', label: '基站区域', width: 170 },
        { prop: 'ip', label: '基站IP', width: 210 }
    ];

    public base: any = null;
    public activeTab: string = 'info';

    public del(row: any) {
        console.log(row);
    }

    public look(row: any) {
        this.base = row;
    }

    protected async _getData(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await http.get('/api/base/getall', {
                pageSize,
                currentPage: page
            });
            data = res.pagedData.datas;
            count = res.pagedData.totalCount;
        } catch (e) {
            //
        }

        return { count, data };
    }
}
</script>


<style lang="postcss" module>
.info {
    height: 100%;
    padding: 3%;
    padding-bottom: 0;
}
</style>

