import Vue from 'vue';
import Router from 'vue-router';
import Main from './views/Main.vue';
import Login from './views/Login.vue';
import Index from './views/index/Index.vue';
import Admin from './views/Admin.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/', name: 'main', component: Main,
      children: [
        { path: 'index', name: 'index', component: Index, alias: '' },
        { path: 'admin', component: Admin }
      ]
    },
    { path: '/login', name: 'login', component: Login },
    { path: '*', redirect: '/index' }
  ],
});
