import Vue from 'vue';
import Vuex from 'vuex';
import { BASE_URL } from './constant';

Vue.use(Vuex);

interface State {
  baseUrl: string;
  rootScale: number;
  isLogin: boolean;
}


export default new Vuex.Store({
  state: {
    baseUrl: BASE_URL,
    rootScale: 1,
    isLogin: false
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
    login(state: State, login: boolean = true) {
      state.isLogin = login;
    }
  },
  actions: {

  },
});
