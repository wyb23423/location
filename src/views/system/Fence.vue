<template>
    <div :class="$style.box">
        <div :class="$style['tool-bar']">
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
            ></map-select>
        </div>
        <div ref="map" style="height: 100%; overflow: hidden"></div>
        <el-collapse v-model="activeNames" :class="$style.op">
            <el-collapse-item
                name="info"
                title="区域信息"
                v-if="!!permission.get"
            >
                <app-table
                    :max-height="255"
                    :table-data="tableData"
                    :col-cfg="colCfg"
                    :total-count="totalCount"
                    :op="operation"
                    :op-width="200"
                    :noPrint="true"
                    :isSmall="true"
                    @updateData="getData"
                    @del="del"
                    @setting="zone = $event"
                    @display="display"
                    :class="$style.table"
                ></app-table>
            </el-collapse-item>
            <el-collapse-item
                title="添加区域"
                name="add"
                v-if="!!permission.post"
            >
                <zone-input
                    v-model="form"
                    :form-height="formHeight"
                    :groups="groups"
                >
                    <el-form-item
                        v-for="(v, index) in form.position"
                        :label="'区域坐标' + (index + 1)"
                        :key="index"
                    >
                        <el-button
                            @click="setPosition(v, index)"
                            :type="v ? 'warning' : 'success'"
                            size="mini"
                        >
                            {{ v ? '删除' : pointIndex >= 0 ? '...' : '设置' }}
                        </el-button>
                        <span class="ellipsis" :class="$style.point">
                            {{ v ? JSON.stringify(v) : '' }}
                        </span>
                    </el-form-item>
                </zone-input>
                <el-button
                    @click="onSubmit"
                    type="success"
                    :class="$style.submit"
                >
                    提交
                </el-button>
            </el-collapse-item>
        </el-collapse>

        <template v-if="!!zone">
            <el-dialog
                title="更改区域信息"
                :visible="!!zone"
                :modal-append-to-body="false"
                @close="zone = null"
            >
                <zone-input v-model="zone" :groups="groups"> </zone-input>

                <template slot="footer">
                    <el-button @click="zone = null">取 消</el-button>
                    <el-button @click="update" type="primary">确 定</el-button>
                </template>
            </el-dialog>
        </template>
    </div>
</template>

<script lang="ts" src="./fence.ts">
</script>

<style lang="postcss" module>
.box {
    position: relative;
    height: 100%;
}

.tool-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: #fcf8e3;
    display: flex;
    align-items: center;
}
.op {
    position: absolute;
    top: 0;
    right: 0;
    width: 390px;

    & div[role='button'] {
        background: #f2f2f2;
        padding-left: 10px;
        border-bottom: 1px solid #ccc;
    }

    & div[role='tabpanel'] {
        padding: 10px;
    }
}
.submit {
    height: 50px;
    width: 100%;
    margin-top: 20px;
}
.point {
    display: inline-block;
    vertical-align: middle;
    width: 190px;
    margin-left: 10px;
}
</style>
