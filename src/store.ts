import Vue from 'vue';
import Vuex from 'vuex';
import { BASE_URL } from './constant';
import { RouteConfig } from 'vue-router/types/router';

Vue.use(Vuex);

interface State {
  baseUrl: string;
  rootScale: number;
  routes: string[];
}


export default new Vuex.Store({
  state: {
    baseUrl: BASE_URL,
    rootScale: 1,
    routes: []
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
    flashRoutes(state: State, routes: RouteConfig[]) {
      state.routes = routes.map(v => v.path);
    }
  },
  actions: {

  },
});
