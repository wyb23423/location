import Vue from 'vue';
import Vuex from 'vuex';
import { BASE_URL } from './config';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    baseUrl: BASE_URL,
    rootScale: 1
  },
  getters: {
    mainHeight(state: any) {
      return `calc(${100 / state.rootScale}vh - 60px)`;
    }
  },
  mutations: {
    setRootScale(state: any, scale: number) {
      state.rootScale = scale;
    }
  },
  actions: {

  },
});
