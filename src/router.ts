import Vue from 'vue';
import Router from 'vue-router';

import Main from './views/Main.vue';
import Login from './views/Login.vue';
import Index from './views/index/Index.vue';

// 管理员设置
const Admin = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Admin.vue');
const AdminList = () => import(/* webpackChunkName: "admin" */ '@/views/admin/AdminList.vue');
const AdminAdd = () => import(/* webpackChunkName: "admin" */ '@/views/admin/AdminAdd.vue');

// 系统设置
const [
  System, Fence, Base,
  CameraList, CameraAdd,
  ProtocolAdd, ProtocolList,
  Submissio
] = [
  'System', 'Fence', 'Base',
  'camera/CameraList', 'camera/CameraAdd',
  'protocol/ProtocolAdd', 'protocol/ProtocolList',
  'protocol/Submissio'
].map(name => () => import(/* webpackChunkName: "system" */ `@/views/system/${name}.vue`));

// 设备管理
const [
  BaseIndex, Info,
  BaseAdd, Calibration
] = [
  'BaseIndex', 'Info',
  'BaseAdd', 'Calibration'
].map(name => () => import(/* webpackChunkName: "base" */ `@/views/base/${name}.vue`));



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
            { path: 'base', name: 'base', component: Base },
            { path: 'camera/add', name: 'camera-add', component: CameraAdd },
            { path: 'camera/list', name: 'camera-list', component: CameraList },
            { path: 'protocol/add', name: 'protocol-add', component: ProtocolAdd },
            { path: 'protocol/list', name: 'protocol-list', component: ProtocolList },
            { path: 'protocol/submissio', name: 'protocol-submissio', component: Submissio }
          ]
        },
        {
          path: 'base', component: BaseIndex,
          children: [
            { path: 'info', name: 'base-info', component: Info, alias: '' },
            { path: 'add', name: 'base-add', component: BaseAdd },
            { path: 'calibration', name: 'calibration', component: Calibration }
          ]
        }
      ]
    },
    { path: '/login', name: 'login', component: Login },
    { path: '*', redirect: '/index' },
  ],
});

