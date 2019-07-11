<template>
    <div :style="{ height: mainHeight }" style="overflow-y: auto">
        <!-- <el-alert
            title="监控区域1->三号楼 F区域设备损坏报警，请尽快维修检查"
            type="warning"
            show-icon
        >
        </el-alert> -->
        <div style="padding: 30px;">
            <div :class="$style.cards">
                <router-link
                    v-for="(v, i) of cards"
                    :key="i"
                    :to="v.to"
                    :class="$style['card-item']"
                >
                    <img :src="`/images/${v.icon}.png`" />
                    <div :class="$style.line_v"></div>
                    <div :class="$style.info">
                        <div>{{ v.title }}</div>
                        <div>{{ v.num }}</div>
                    </div>
                </router-link>
            </div>

            <el-collapse v-model="activeNames" :class="$style.collapse">
                <el-collapse-item title="监控信息：图表" name="1">
                    <el-row :class="$style['collapse-item']">
                        <el-col :span="12">
                            <div
                                ref="main"
                                style="height: 400px; border-right: 1px solid #ccc;"
                            ></div>
                        </el-col>
                        <el-col :span="12">
                            <div
                                ref="myChart2"
                                style="height: 400px;padding-left: 10%;"
                            ></div>
                        </el-col>
                    </el-row>
                </el-collapse-item>
            </el-collapse>

            <el-collapse v-model="activeNames" :class="$style.collapse">
                <el-collapse-item title="区域信息：记录" name="2">
                    <el-timeline :class="$style['collapse-item']">
                        <el-timeline-item
                            v-for="(v, i) in records"
                            :key="i"
                            :type="v.type"
                            :timestamp="v.timestamp"
                        >
                            {{ v.content }}
                        </el-timeline-item>
                    </el-timeline>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script lang="ts" src="./index.ts">
</script>

<style lang="postcss" module>
.cards {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
.card-item {
    background: #fff;
    height: 120px;
    width: 23%;
    max-width: 350px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
    cursor: pointer;

    @media (width <= 768px) {
        width: 47%;
    }

    @media (width <= 420px) {
        width: 100%;
    }
}
.line_v {
    width: 2px;
    height: 100%;
    background: #ccc;
}
.info {
    font-size: 22px;
    text-align: center;

    & > div {
        padding: 10px;
    }
}
.collapse {
    margin-bottom: 25px;
    background: #fff;
    font-size: 20px !important;

    & > div {
        padding: 10px 20px 0;
    }
}
.collapse-item {
    border-top: 2px solid #ccc;
    padding: 10px;
}
</style>