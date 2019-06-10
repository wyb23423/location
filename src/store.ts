import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    baseUrl: 'http://192.168.1.189',
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
