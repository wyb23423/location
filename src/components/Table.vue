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
                :min-width="v.width == null ? undefined : v.width * scale"
            >
            </el-table-column>
            <el-table-column
                label="操作"
                fixed="right"
                :resizable="true"
                v-if="op && op.length"
                :min-width="opWidth == null ? undefined : opWidth * scale"
            >
                <template slot-scope="scope">
                    <div class="flex-center">
                        <el-button
                            v-for="(v, i) of op"
                            :key="i"
                            size="mini"
                            :type="v.type | parse(scope.$index)"
                            @click="emit(v.name, scope.row, scope.$index)"
                        >
                            {{ v.desc | parse(scope.$index) }}
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div class="flex-center" style="justify-content: space-between;">
            <el-button
                size="mini"
                icon="el-icon-printer"
                @click="emit('toExcel')"
                v-if="!noPrint"
            >
                导出
            </el-button>
            <el-pagination
                :current-page="page"
                :page-size="pageSize"
                :layout="`${isSmall ? '' : 'sizes, '}prev, pager, next`"
                :total="totalCount"
                :small="!!isSmall"
                :hide-on-single-page="!!isSmall"
                :pager-count="5"
                @size-change="updateData('pageSize', $event)"
                @current-change="updateData('page', $event)"
            >
            </el-pagination>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import { SX_WIDTH, DEFAULT_WIDTH } from '../constant';

type OperationItem = string | { [i: string]: string };

export interface TableRowOperation {
    type: OperationItem;
    name: OperationItem;
    desc: OperationItem;
}

@Component({
    filters: { parse: parseOpItem }
})
export default class Table extends Vue {
    @Prop() public maxHeight!: number; // 最大高度
    @Prop() public tableData!: any[]; // 表格数据
    @Prop() public totalCount!: number; // 数据总条数
    @Prop() public colCfg!: any[]; // 列配置

    @Prop() public op!: TableRowOperation[]; // 操作
    @Prop() public noPrint!: boolean;
    @Prop() public isSmall!: boolean;
    @Prop() public opWidth?: boolean;

    public pageSize: number = 10;
    public page: number = 1;
    public scale: number = 1;

    private timer?: any;

    // public created() {
    //     this.scaleRoot();
    //     window.addEventListener('resize', this.scaleRoot.bind(this), false);
    // }

    public emit(name: string, row: any, index: number) {
        name = parseOpItem(name, index);
        this.$emit(name, row, index);
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

    private scaleRoot() {
        if (document.body.clientWidth <= SX_WIDTH) {
            this.scale = SX_WIDTH / DEFAULT_WIDTH;
        } else {
            this.scale = 1;
        }
    }
}

// 处理表格操作按钮
function parseOpItem(item: OperationItem, index: number) {
    if (typeof item === 'string') {
        return item;
    }

    return item[index] || item.default || '404';
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
</style>
