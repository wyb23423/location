import Vue from 'vue';
import Router from 'vue-router';

import Main from './views/Main.vue';
import Login from './views/Login.vue';
import Index from './views/index/Index.vue';

import Admin from './views/admin/Admin.vue';
import AdminList from './views/admin/AdminList.vue';
import AdminAdd from './views/admin/AdminAdd.vue';

import System from './views/system/System.vue';

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
            // { path: 'list', name: 'admin-list', component: AdminList, alias: '' },
            // { path: 'add', name: 'admin-add', component: AdminAdd }
          ]
        }
      ]
    },
    { path: '/login', name: 'login', component: Login },
    { path: '*', redirect: '/index' },
  ],
});
