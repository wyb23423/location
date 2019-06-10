<template>
    <div>
        <el-table
            :data="tableData"
            :border="true"
            :header-row-class-name="$style.thead"
            :max-height="maxHeight"
            style="margin-bottom: 10px"
        >
            <el-table-column
                v-for="(v, i) of colCfg"
                :key="i"
                :prop="v.prop"
                :label="v.label"
                :sortable="!!v.sortable"
                :resizable="true"
                :width="v.width"
            >
            </el-table-column>
            <el-table-column
                label="操作"
                :resizable="true"
                v-if="op && op.length"
            >
                <template slot-scope="scope">
                    <el-button
                        v-for="v of op"
                        :key="v.name"
                        size="mini"
                        :type="v.type"
                        @click="emit(v.name, scope.row)"
                    >
                        {{ v.desc }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div>
            <el-button
                size="mini"
                icon="el-icon-printer"
                :class="$style.out"
                @click="emit('toExcel')"
            >
                导出
            </el-button>
            <el-pagination
                :current-page="page"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalCount"
                @size-change="updateData('pageSize', $event)"
                @current-change="updateData('page', $event)"
                style="text-align: right"
            >
            </el-pagination>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';

interface Operation {
    type: string;
    name: string;
    desc: string;
}

@Component
export default class Table extends Vue {
    @Prop() public maxHeight?: number; // 最大高度
    @Prop() public tableData?: any[]; // 表格数据
    @Prop() public totalCount?: number; // 数据总条数
    @Prop() public colCfg?: any[]; // 列配置

    @Prop() public op?: Operation[]; // 操作

    public pageSize: number = 10;
    public page: number = 1;

    private timer?: any;

    public emit(name: string, row: any) {
        this.$emit(name, row);
    }

    public updateData(type: 'page' | 'pageSize', data: number) {
        this[type] = data;

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.timer = setTimeout(
            () => this.$emit('updateData', this.page, this.pageSize),
            200
        );
    }
}
</script>

<style lang="postcss" module>
.thead {
    font-weight: bold;
    font-size: 18px;
    color: #000;

    & th {
        background: #eee !important;
    }
}
.out {
    float: left;
    margin-top: 10px;
}
</style>
