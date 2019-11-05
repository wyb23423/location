<template>
    <div class="map-box">
        <div ref="map" :class="$style.map"></div>
        <div
            :class="[$style.map, $style.mask]"
            v-show="isDrawing"
            @pointermove="move"
            @pointerup="addPoint"
        ></div>
        <div class="map-tool-bar" style="display: flex; align-items: center">
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
                v-show="!isDrawing"
            ></map-select>
            <div v-if="isDrawing" style="padding-left: 10%; width: 100%">
                <el-button
                    size="mini"
                    icon="el-icon-d-arrow-left"
                    :disabled="!points.length"
                    @click="prev"
                ></el-button>
                <el-button
                    size="mini"
                    icon="el-icon-d-arrow-right"
                    :disabled="!popPoints.length"
                    @click="next"
                ></el-button>
                <el-button
                    size="mini"
                    icon="el-icon-check"
                    @click="surePositionSetting"
                ></el-button>
                <el-button
                    size="mini"
                    icon="el-icon-close"
                    @click="cancelPositionSetting"
                ></el-button>
            </div>
        </div>

        <el-collapse
            v-model="activeNames"
            :class="$style.op"
            v-show="!isDrawing"
        >
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
                    @setting="openSetting"
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
                    form-height="calc(100vh - 560px)"
                    :groups="groups"
                >
                    <el-form-item label="区域顶点">
                        <el-button
                            size="mini"
                            type="primary"
                            @click="enterDrawingMode"
                        >
                            设置
                        </el-button>
                    </el-form-item>
                </zone-input>
                <el-button @click="put" type="success" :class="$style.submit">
                    提交
                </el-button>
            </el-collapse-item>
        </el-collapse>

        <template v-if="isSetting">
            <el-dialog
                title="更改区域信息"
                :visible="true"
                :modal-append-to-body="false"
                @close="cancelSetting"
            >
                <zone-input v-model="zone" :groups="groups">
                    <el-form-item label="区域顶点">
                        <el-button
                            size="mini"
                            type="primary"
                            @click="enterSettingMode"
                        >
                            设置
                        </el-button>
                    </el-form-item>
                </zone-input>

                <template slot="footer">
                    <el-button @click="cancelSetting">取 消</el-button>
                    <el-button @click="update" type="primary">确 定</el-button>
                </template>
            </el-dialog>
        </template>
    </div>
</template>

<script lang="ts" src="./zone.ts">
</script>

<style lang="postcss" module>
.op {
    position: absolute;
    top: 0;
    right: 0;
    width: 390px;
    max-width: 100%;

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

.map {
    height: 100%;
    overflow: hidden;
}

.mask {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    touch-action: none;
}
</style>
