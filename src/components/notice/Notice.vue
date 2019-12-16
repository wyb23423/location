<template>
    <div>
        <el-badge
            :value="messages.length"
            type="danger"
            :max="999"
            :hidden="messages.length <= 0"
            style="z-index: 1"
        >
            <el-tooltip content="实时报警" effect="light">
                <i
                    class="el-icon-bell"
                    style="font-size: 18px"
                    @click="drawer = true"
                ></i>
            </el-tooltip>
        </el-badge>
        <el-drawer title="报警列表" :visible.sync="drawer" :size="size">
            <el-table
                :data="list"
                style="padding: 0 10px"
                stripe
                size="mini"
                ref="table"
                :max-height="maxHeight"
                @selection-change="selected = $event"
            >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column
                    prop="type"
                    label="报警类型"
                    min-width="80"
                    :filters="filters.type"
                    :filter-method="filterHandler"
                ></el-table-column>
                <el-table-column
                    prop="deviceId"
                    label="标签号"
                    min-width="100"
                    :filters="filters.deviceId"
                    :filter-method="filterHandler"
                ></el-table-column>
                <el-table-column
                    prop="time"
                    label="报警时间"
                    min-width="160"
                    :filters="filters.time"
                    :filter-method="filterHandler"
                    :formatter="formatter"
                ></el-table-column>
                <el-table-column
                    prop="content"
                    label="报警信息"
                    min-width="255"
                ></el-table-column>
            </el-table>
            <div class="flex-center" :class="$style.bottom">
                <el-button
                    @click="doDeal"
                    :disabled="!selected.length"
                    size="mini"
                >
                    清除异常
                </el-button>
                <el-pagination
                    small
                    hide-on-single-page
                    layout="prev, pager, next"
                    :total="messages.length"
                    :page-size="50"
                    @current-change="page = $event"
                >
                </el-pagination>
            </div>
        </el-drawer>
    </div>
</template>

<script lang="ts" src="./notice.ts">
</script>

<style lang="postcss" module>
.bottom {
    justify-content: space-between !important;
    margin-top: 20px;
    padding-left: 10px;
}
</style>

<style lang="postcss">
.notice-component {
    z-index: 2000 !important;
}
</style>