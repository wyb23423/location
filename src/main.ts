/// <reference path="./types/vue-module.d.ts" />

import Vue from 'vue';
import App from './App.vue';
import router, { initRouter } from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/public.css';
import * as http from './assets/utils/http';
import { Route } from 'vue-router';
import VueWorker from 'vue-worker';
import VueCropper from 'vue-cropper';
import * as PIXI from 'pixi.js';
import { initConfig } from './constant';

(<any>window).PIXI = PIXI; // add code
(<any>window).PIXI.default = PIXI;

Vue.use(VueCropper)
  .use(ElementUI)
  .use(VueWorker);
Vue.prototype.$http = http;

Vue.config.productionTip = false;

/**
 * 判断是否未登录
 * 未登录时跳转到登录界面
 */
router.beforeEach((to: Route, from: Route, next: any) => {
  const isLogin = sessionStorage.getItem('login');
  if (!(isLogin && +isLogin) && to.path !== '/login') {
    http.get('/api/admin/getall', {
      pageSize: 1,
      currentPage: 1
    })
      .then(() => {
        sessionStorage.setItem('login', '1');
        next();
      })
      .catch(e => {
        next('/login');
      });
  } else {
    next();
  }
});

initConfig()
  .then(() => {
    if (+(<string>sessionStorage.getItem('login'))) {
      console.log('load router...');
      initRouter();
    }

    console.log('app init...');
    new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount('#app');
  });


