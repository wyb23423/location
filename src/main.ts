/// <reference path="./types/vue-crropper.d.ts" />

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/public.css';
import * as http from './assets/utils/http';
import { Route } from 'vue-router';

import VueCropper from 'vue-cropper';
Vue.use(VueCropper);

Vue.use(ElementUI);

// vscode中 类型无法识别, 暂时放弃全局注入
// Vue.prototype.$http = http;

Vue.config.productionTip = false;

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
