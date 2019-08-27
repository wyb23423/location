import Vue from 'vue';
import Vuex from 'vuex';
import { BASE_URL } from './constant';

Vue.use(Vuex);

export interface ZoneMode {
  in: number; // 进入区域
  out: number; // 离开区域
  switch: number; // 切换区域
  group: number; // 分组区域
  other: number; // 其他
}

interface State {
  baseUrl: string;
  rootScale: number;
  zoneMode: ZoneMode;
}


export default new Vuex.Store({
  state: {
    baseUrl: BASE_URL,
    rootScale: 1,
    zoneMode: {
      in: 2,
      out: 3,
      switch: 1,
      group: 4,
      other: 5
    }
  },
  getters: {
    mainHeight(state: State) {
      return `calc(${100 / state.rootScale}vh - 60px)`;
    }
  },
  mutations: {
    setRootScale(state: State, scale: number) {
      state.rootScale = scale;
    },
  },
  actions: {

  },
});
