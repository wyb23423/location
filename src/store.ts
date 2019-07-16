import Vue from 'vue';
import Vuex from 'vuex';
import { BASE_URL } from './constant';
import { RouteConfig } from 'vue-router/types/router';

Vue.use(Vuex);

interface State {
  baseUrl: string;
  rootScale: number;
}


export default new Vuex.Store({
  state: {
    baseUrl: BASE_URL,
    rootScale: 1
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
