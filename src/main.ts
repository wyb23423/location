/// <reference path="./types/vue-module.d.ts" />

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/public.css';
import * as http from './assets/utils/http';
import { Route } from 'vue-router';
import VueWorker from 'vue-worker';
import VueCropper from 'vue-cropper';

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
  if (!store.state.isLogin && to.path !== '/login') {
    http.get('/api/admin/getall', {
      pageSize: 1,
      currentPage: 1
    })
      .then(() => {
        store.commit('login');
        next();
      })
      .catch(e => {
        next('/login');
      });
  } else {
    next();
  }
});


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
