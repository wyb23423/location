<template>
    <div style="padding: 5%; height: 100%" v-if="!base">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="op"
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
            @back="base = null"
            style="margin-bottom: 20px"
        ></el-page-header>

        <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="设备信息" name="info">
                <base-info :data="base"></base-info>
            </el-tab-pane>
            <el-tab-pane
                label="基本属性设置"
                name="primary"
                v-if="!!permission.put"
            >
                <base-primary :data="base"></base-primary>
            </el-tab-pane>
            <el-tab-pane
                label="网络参数设置"
                name="net"
                v-if="!!permission.put"
            >
                <base-net :data="base"></base-net>
            </el-tab-pane>
            <el-tab-pane
                label="位置设置"
                name="position"
                v-if="!!permission.put"
            >
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
import { encodeUtf8 } from '@/assets/utils/util';

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

    public base: IBaseStation | null = null;
    public activeTab: string = 'info';

    public get op() {
        const op = [{ type: 'success', name: 'look', desc: '查看详情' }];
        if (this.permission.delete) {
            op.push({ type: 'danger', name: 'del', desc: '删除' });
        }

        return op;
    }

    public del(row: IBaseStation) {
        this.$confirm(`删除基站${row.name}?`)
            .then(() => this.$http.post('/api/base/deleteBase', { id: row.id }))
            .then(() => {
                this.$message.success('删除成功');
                this.refresh();
            })
            .catch(console.log);
    }

    public look(row: IBaseStation) {
        this.$http
            .post({
                url: '/api/protocol/sendReceive',
                body: {
                    ip: '192.168.1.19', // row.ip,
                    port: 60000,
                    protocol: '2345201801230D0A'
                }
            })
            .then(res => {
                console.log(encodeUtf8(res.resultMap.resp));
                this.base = row;
            })
            .catch(console.log);
    }

    protected async fetch(page: number, pageSize: number) {
        let data: any[] = [];
        let count: number = 0;
        try {
            const res = await this.$http.get('/api/base/getall', {
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


<style lang="postcss" module>
.info {
    height: 100%;
    padding: 3%;
    padding-bottom: 0;
}
</style>

