/// <reference path="./types/vue-module.d.ts" />

import Vue from 'vue';
import App from './App.vue';
import router, { initRouter } from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/public.css';
import HTTP from './assets/lib/http';
import VueWorker from 'vue-worker';
import VueCropper from 'vue-cropper';
import * as PIXI from 'pixi.js';
import { initConfig } from './constant';
import Events from './assets/lib/events';
import { formatDate } from './assets/lib/date';
import { awaitWrap } from './assets/utils/util';
import { Route } from 'vue-router';
import { GET_ADMIN } from './constant/request';

// ========================================全局变量及注入vue实例的属性
(<any>window).PIXI = PIXI;
(<any>window).PIXI.default = PIXI;

const http = new HTTP();
Object.assign(
    Vue.use(VueCropper).use(ElementUI).use(VueWorker).prototype,
    {
        $http: http,
        $event: new Events(),
        $async: awaitWrap
    }
);
Vue.config.productionTip = false;

// ====================================全局路由守卫
/**
 * 判断是否未登录
 * 未登录时跳转到登录界面
 */
router.beforeEach((to: Route, from: Route, next: any) => {
    const isLogin = sessionStorage.getItem('login');
    if (!(isLogin && +isLogin) && to.path !== '/login') {
        http.get(GET_ADMIN, {
            pageSize: 1,
            currentPage: 1
        })
            .then(() => {
                sessionStorage.setItem('login', '1');
                initRouter();
                next(to);
            })
            .catch(e => {
                next(false);
                location.href = '/login';
            });
    } else {
        next();
    }
});

// =============================================全局filter
Vue.filter('date', formatDate);

// ==================================初始化
async function init() {
    const { err } = await awaitWrap(initConfig());
    if (!err) {
        if (+(<string>sessionStorage.getItem('login'))) {
            console.log('load router...');
            initRouter();
        }

        console.log('app init...');
        new Vue({ router, store, render: (h) => h(App) }).$mount('#app');
    }
}
init();
