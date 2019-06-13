import Vue from 'vue';
import Router from 'vue-router';

import Main from './views/Main.vue';
import Login from './views/Login.vue';
import Index from './views/index/Index.vue';

// 管理员设置
import Admin from './views/admin/Admin.vue';
import AdminList from './views/admin/AdminList.vue';
import AdminAdd from './views/admin/AdminAdd.vue';

// 系统设置
import System from './views/system/System.vue';
import Fence from './views/system/Fence.vue';
import Base from './views/system/base/Base.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/', name: 'main', component: Main,
      children: [
        { path: 'index', name: 'index', component: Index, alias: '' },
        {
          path: 'admin', component: Admin,
          children: [
            { path: 'list', name: 'admin-list', component: AdminList, alias: '' },
            { path: 'add', name: 'admin-add', component: AdminAdd }
          ]
        },
        {
          path: 'system', component: System,
          children: [
            { path: 'fence', name: 'fence', component: Fence, alias: '' },
            { path: 'base', name: 'base', component: Base }
          ]
        }
      ]
    },
    { path: '/login', name: 'login', component: Login },
    { path: '*', redirect: '/index' },
  ],
});
