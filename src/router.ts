import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';

import Login from './views/Login.vue';
import Main from './views/Main.vue';
import Index from './views/index/Index.vue';
import NotFound from './views/NotFound.vue';

import { RouteList } from './assets/lib/role';

Vue.use(Router);

const router = new Router({
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/404', name: '404', component: NotFound }
  ],
  mode: 'history',
  base: process.env.BASE_URL,
});


// ==========================根据权限初始化路由
let loadRouter = false;
export function initRouter() {
  if (loadRouter) {
    return;
  }

  const routes = new RouteList().routes;

  router.addRoutes([
    {
      path: '/', name: 'main', component: Main,
      children: [
        { path: 'index', name: 'index', component: Index, alias: '' },
        ...(<RouteConfig[]>routes)
      ]
    },
    { path: '*', redirect: '/404' }
  ]);

  loadRouter = true;
}

export default router;
