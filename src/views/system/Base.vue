<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[{ type: 'warning', name: 'setting', desc: '配置基站' }]"
                :op-width="200"
                @setting="setting"
                @updateData="getData"
                @toExcel="toExcel"
            ></app-table>
        </el-card>

        <el-dialog
            :visible="!!settingData"
            :modal-append-to-body="false"
            top="5vh"
            title="基站配置"
            @close="close"
            v-if="!!settingData"
        >
            <el-row style="margin-bottom: 20px;">
                <el-col :span="17">
                    <p>基站名称: {{ settingData.name + '基站' }}</p>
                    <p>基站编号: {{ settingData.baseNo }}</p>
                    <p>分组编号: {{ settingData.groupCode }}</p>
                    <p>
                        基站类型:
                        {{ settingData.main ? '从基站' : '主基站' }}
                    </p>
                </el-col>
                <el-col :span="7">
                    <img
                        :src="baseUrl + 'public/image/80530151701.png'"
                        alt="基站"
                        style="width: 100%; max-width: 100px"
                    />
                </el-col>
            </el-row>

            <el-tabs v-model="tab" type="card">
                <el-tab-pane
                    label="基本属性设置"
                    name="base"
                    :lazy="true"
                    size="mini"
                >
                    <el-form
                        :model="settingData"
                        label-width="100px"
                        label-position="left"
                        style="padding: 0 15% 0 5%"
                    >
                        <el-form-item label="所属组号">
                            <el-input v-model="settingData.groupCode">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="基站标示">
                            <el-select v-model="settingData.main">
                                <el-option
                                    :value="0"
                                    label="从基站"
                                ></el-option>
                                <el-option
                                    :value="1"
                                    label="主基站"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="网络参数设置" name="net" :lazy="true">
                    <el-form :model="settingData"> </el-form>
                </el-tab-pane>
            </el-tabs>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import TableMixin from '../../mixins/table';
import * as http from '../../assets/utils/http';

@Component
export default class Base extends mixins(TableMixin) {
    @State public baseUrl!: string;

    public colCfg: any[] = [
        { prop: 'id', label: '基站ID', sortable: true, width: 220 },
        { prop: 'baseNo', label: '基站编号', width: 220 },
        { prop: 'name', label: '基站名称', width: 220 },
        { prop: 'zone', label: '基站区域', width: 220 },
        { prop: 'ip', label: '基站IP', width: 220 }
    ];

    public settingData: any = null;
    public tab: string = 'base';

    public setting(row: any) {
        this.settingData = row;
    }

    public close() {
        this.settingData = null;
    }

    protected async fetch(page: number, pageSize: number) {
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
