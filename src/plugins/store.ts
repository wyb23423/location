import Vue from 'vue';
import Vuex from 'vuex';
import { BASE_URL } from '../constant';

Vue.use(Vuex);

export interface ZoneMode {
    // in: number; // 进入区域
    // out: number; // 离开区域
    switch: number; // 切换区域
    group: number; // 分组区域
    fence: number; // 电子围栏
}

const store = new Vuex.Store({
    state: {
        baseUrl: BASE_URL,
        zoneMode: {
            switch: 1,
            // in: 2,
            // out: 3,
            group: 4,
            fence: 5
        },
        modeDescript: ['', '切换区域', '进入区域', '离开区域', '分组区域', '电子围栏'],
        rootWidth: 2000
    },
    mutations: {
        rootWidth(state, width: number) {
            state.rootWidth = width;
        }
    }
});

export default store;
