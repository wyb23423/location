<template>
    <div style="overflow-y: auto; height: calc(100vh - 60px)">
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
                <el-collapse-item title="区域信息：记录" name="2">
                    <el-timeline :class="$style['collapse-item']">
                        <el-timeline-item
                            v-for="(v, i) of records"
                            :key="i"
                            :type="v.type"
                            :timestamp="v.timestamp | date"
                        >
                            {{ v.content }}
                        </el-timeline-item>
                    </el-timeline>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { GET_ALARM, GET_ZONE, GET_TAG, GET_ADMIN } from '@/constant/request';

interface CardInfo {
    icon: string;
    title: string;
    num: number;
    to: string;
}

interface RecordItem {
    content: string;
    timestamp: number;
    type: string;
}

@Component
export default class Main extends Vue {
    public activeNames: string[] = ['1', '2'];
    public cards: CardInfo[] = [
        { icon: 'qy', title: '监控区域', num: 3, to: '/system/zone' },
        { icon: 'adminbg', title: '管理人员', num: 3, to: '/admin/list' },
        { icon: 'ter', title: '监控人员', num: 3, to: '/device/tag/list/1' },
        { icon: 'bj', title: '报警次数', num: 3, to: '/monitor/alarm' }
    ];
    public records: RecordItem[] = []; // 报警记录

    public created() {
        this.$http
            .get(GET_ALARM, {
                pageSize: 20,
                currentPage: 1
            })
            .then(res => {
                this.records = res.pagedData.datas.map((v: IAlarm) => ({
                    type: 'warning',
                    content: v.content,
                    timestamp: v.time
                }));
            })
            .catch(console.log);
    }
    public mounted() {
        const api = [GET_ZONE, GET_ADMIN, GET_TAG, GET_ALARM];
        api.forEach(async (url, i) => {
            const { value, err } = await this.$async(
                this.$http.get(url, { currentPage: 1, pageSize: 1 })
            );
            value && !err && (this.cards[i].num = value.pagedData.totalCount);

            err && console.error(err);
        });
    }
}
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