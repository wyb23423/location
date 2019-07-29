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
                <el-form
                    :model="form"
                    ref="form"
                    label-width="90px"
                    :class="$style.form"
                    :style="{ 'max-height': formHeight }"
                >
                    <el-form-item label="区域名称" required>
                        <el-input
                            v-model="form.name"
                            placeholder="请输入名称"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="区域模式">
                        <el-select v-model="form.mode" placeholder="请选择">
                            <el-option label="进入区域" :value="0"></el-option>
                            <el-option label="离开区域" :value="1"></el-option>
                            <el-option
                                label="切换区域"
                                :value="2"
                                v-if="groups.length >= 2"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <template v-if="form.mode === 2">
                        <el-form-item label="基站分组1">
                            <el-select v-model="form.group1">
                                <el-option
                                    v-for="v of groups"
                                    :key="v"
                                    :value="v"
                                    :disabled="v === form.group2"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="基站分组2">
                            <el-select v-model="form.group2">
                                <el-option
                                    v-for="v of groups"
                                    :key="v"
                                    :value="v"
                                    :disabled="v === form.group1"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </template>
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
                    <el-form-item label="启动">
                        <el-switch
                            v-model="form.open"
                            active-text="true"
                            inactive-text="false"
                        >
                        </el-switch>
                    </el-form-item>
                </el-form>
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
                <el-form label-width="auto" ref="form">
                    <el-form-item label="区域名称" required>
                        <el-input
                            v-model="zone.name"
                            style="width: 70%"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="区域模式">
                        <el-select v-model="zone.mode" placeholder="请选择">
                            <el-option label="进入区域" :value="0"></el-option>
                            <el-option label="离开区域" :value="1"></el-option>
                            <el-option label="切换区域" :value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="启动">
                        <el-switch
                            v-model="zone.open"
                            active-text="true"
                            inactive-text="false"
                        >
                        </el-switch>
                    </el-form-item>
                </el-form>

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
.form {
    overflow: auto;
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
