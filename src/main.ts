/// <reference path="./types/vue-module.d.ts" />

import Vue from 'vue';
import App from './App.vue';
import router, { initRouter } from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/public.css';
import * as http from './assets/lib/http';
import { Route } from 'vue-router';
import VueWorker from 'vue-worker';
import VueCropper from 'vue-cropper';
import * as PIXI from 'pixi.js';
import { initConfig } from './constant';
import Events from './assets/lib/events';

// ========================================全局变量及注入vue实例的属性
(<any>window).PIXI = PIXI; // add code
(<any>window).PIXI.default = PIXI;

Vue.use(VueCropper)
  .use(ElementUI)
  .use(VueWorker);
Vue.prototype.$http = http;
Vue.prototype.$event = new Events();
Vue.config.productionTip = false;


// ====================================全局路由守卫
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
        initRouter();
        next(to);
      })
      .catch(e => {
        next('/login');
      });
  } else {
    next();
  }
});


// =============================================全局filter
Vue.filter('date', (value: number, fmt: string = 'yyyy/MM/dd hh:mm:ss') => {
  const date = new Date(value);

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  const o = [
    'M+', date.getMonth() + 1,
    'd+', date.getDate(),
    'h+', date.getHours(),
    'm+', date.getMinutes(),
    's+', date.getSeconds()
  ];

  for (let i = 0; i < o.length; i++) {
    if (new RegExp(`(${o[i++]})`).test(fmt)) {
      const str = o[i] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : str.padStart(str.length, '0'));
    }
  }
  return fmt;
});


// ==================================初始化
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
