import Vue from 'vue';
import Router from 'vue-router';

import Login from '@/views/Login.vue';
import Main from '@/views/Main.vue';
import Index from '@/views/index/Index.vue';
import NotFound from '@/views/NotFound.vue';
import getRoutes from './route';

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

    router.addRoutes([
        {
            path: '/', name: 'main', component: Main,
            children: [
                { path: 'index', name: 'index', component: Index, alias: '' },
                ...getRoutes(),
                {
                    path: '/chart', name: 'chart',
                    component: () => import(/* webpackChunkName: "chart" */ '@/views/chart/ChartIndex.vue'),
                    children: [
                        {
                            path: 'heatmap', name: 'heatmap',
                            component: () => import(/* webpackChunkName: "chart" */ '@/views/chart/HeatMap.vue'),
                        },
                        {
                            path: 'charts', name: 'charts', alias: '',
                            component: () => import(/* webpackChunkName: "chart" */ '@/views/chart/Charts.vue'),
                        }
                    ]
                }
            ]
        },
        { path: '*', redirect: '/404' }
    ]);

    loadRouter = true;
}

export default router;
