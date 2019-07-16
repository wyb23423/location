/**
 * 权限相关
 */
import { RouteConfig, Route } from 'vue-router/types/router';

export class RouteList {
    public routes: RouteConfig[] = [];

    private systemRoles: any = {};

    constructor(private role: string) {
        const data = sessionStorage.getItem('config');
        if (data) {
            this.systemRoles = JSON.parse(data).system;

            ['admin', 'system', 'base', 'people', 'map', 'alarm'].forEach(v => {
                Reflect.get(this, v).call(this);
            });
        }
    }

    // 生成管理员相关路由
    public admin() {
        const routes: RouteConfig[] = [];

        if (this.hasPermission('admin', 'get')) {
            routes.push({
                path: 'list',
                name: 'admin-list',
                component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/AdminList.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('admin', 'delete'),
                        post: this.hasPermission('admin', 'post')
                    }
                }
            });
        }

        if (this.hasPermission('admin', 'put')) {
            routes.push({
                path: 'add',
                name: 'admin-add',
                component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/AdminAdd.vue')
            });
        }

        if (routes.length) {
            routes[0].alias = '';
            this.routes.push({
                path: 'admin',
                name: 'admin',
                component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/Admin.vue'),
                children: routes
            });
        }
    }

    // 生成系统设置相关路由
    public system() {
        const routes: RouteConfig[] = ['fence', 'camera', 'protocol'].map(k => {
            const func = Reflect.get(this, k);
            return func.call(this);
        }).flat();

        if (routes.length) {
            routes[0].alias = '';
            this.routes.push({
                path: 'system',
                name: 'system',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/System.vue'),
                children: routes
            });
        }
    }
    // 区域
    public fence() {
        if (this.hasPermission('fence', 'get')) {
            return [{
                path: 'fence',
                name: 'fence',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/Fence.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('fence', 'delete'),
                        post: this.hasPermission('fence', 'post'),
                        put: this.hasPermission('fence', 'put')
                    }
                }
            }];
        }

        return [];
    }
    // 摄像机
    public camera() {
        const routes: RouteConfig[] = [];
        if (this.hasPermission('camera', 'get')) {
            routes.push({
                path: 'camera/list',
                name: 'camera-list',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/camera/CameraList.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('camera', 'delete'),
                        post: this.hasPermission('camera', 'post')
                    }
                }
            });
        }

        if (this.hasPermission('camera', 'put')) {
            routes.push({
                path: 'camera/add',
                name: 'camera-add',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/camera/CameraAdd.vue')
            });
        }

        return routes;
    }
    // 协议
    public protocol() {
        const routes: RouteConfig[] = [];
        if (this.hasPermission('protocol', 'get')) {
            routes.push({
                path: 'protocol/list',
                name: 'protocol-list',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/protocol/ProtocolList.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('protocol', 'delete')
                    }
                }
            });
        }

        if (this.hasPermission('protocol', 'put')) {
            routes.push({
                path: 'protocol/add',
                name: 'protocol-add',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/protocol/ProtocolAdd.vue')
            });
        }

        if (this.hasPermission('protocol', 'post')) {
            routes.push({
                path: 'protocol/submissio',
                name: 'protocol-submissio',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/protocol/Submissio.vue')
            });
        }

        return routes;
    }

    // 设备
    public base() {
        const postPermission = this.hasPermission('base', 'post');
        const routes: RouteConfig[] = [];

        if (this.hasPermission('base', 'get')) {
            routes.push({
                path: 'info', alias: '', name: 'base-info',
                component: () => import(/* webpackChunkName: "base" */ '@/views/base/Info.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('base', 'delete'),
                        post: postPermission
                    }
                }
            });
        }

        if (this.hasPermission('base', 'put')) {
            routes.push({
                path: 'add', name: 'base-add',
                component: () => import(/* webpackChunkName: "base" */ '@/views/base/BaseAdd.vue')
            });
        }

        if (postPermission) {
            routes.push({
                path: 'calibration', name: 'calibration',
                component: () => import(/* webpackChunkName: "base" */ '@/views/base/Calibration.vue')
            });
        }

        if (routes.length) {
            routes[0].alias = '';
            this.routes.push({
                path: 'base', name: 'base',
                component: () => import(/* webpackChunkName: "base" */ '@/views/base/BaseIndex.vue'),
                children: routes
            });
        }
    }

    // 人员管理
    public people() {
        const routes: RouteConfig[] = [];
        let redirect = '';
        if (this.hasPermission('people', 'get')) {
            routes.push({
                path: 'list/:type',
                name: 'people-list',
                component: () => import(/* webpackChunkName: "people" */ '@/views/people/PeopleList.vue'),
                props: (route: Route) => ({
                    type: route.params.type,
                    permission: {
                        delete: this.hasPermission('admin', 'delete'),
                        post: this.hasPermission('admin', 'post')
                    }
                })
            });
            redirect = 'people/list/1';
        }

        if (this.hasPermission('people', 'put')) {
            routes.push({
                path: 'add', name: 'people-add',
                component: () => import(/* webpackChunkName: "people" */ '@/views/people/PeopleAdd.vue')
            });
            redirect = redirect || '/people/add';
        }

        if (routes.length) {
            this.routes.push({
                path: 'people', redirect, name: 'people',
                component: () => import(/* webpackChunkName: "people" */ '@/views/people/PeopleIndex.vue'),
                children: routes
            });
        }
    }

    // 地图、实时监控
    public map() {
        const routes: RouteConfig[] = [];

        if (this.hasPermission('map', 'get')) {
            routes.push(
                {
                    path: '', name: 'monitor',
                    component: () => import(/* webpackChunkName: "map" */ '@/views/map/Monitor.vue')
                },
                {
                    path: 'history', name: 'history',
                    component: () => import(/* webpackChunkName: "map" */ '@/views/map/History.vue')
                }
            );
        }

        if (this.hasPermission('map', 'put')) {
            routes.push({
                path: 'add', name: 'map-add',
                component: () => import(/* webpackChunkName: "map" */ '@/views/map/MapAdd.vue')
            });
        }

        if (this.hasPermission('map', 'post') || this.hasPermission('map', 'delete')) {
            routes.push({
                path: 'edit', name: 'map-edit',
                component: () => import(/* webpackChunkName: "map" */ '@/views/map/MapUpdate.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('admin', 'delete'),
                        post: this.hasPermission('admin', 'post')
                    }
                }
            });
        }

        if (routes.length) {
            if (routes[0].path) {
                routes[0].alias = '';
            }

            this.routes.push({
                path: 'monitor', children: routes,
                component: () => import(/* webpackChunkName: "map" */ '@/views/map/MapIndex.vue')
            });
        }
    }

    // 报警信息
    public alarm() {
        if (this.hasPermission('alarm', 'get')) {
            this.routes.push({
                path: 'alarm', name: 'alarm',
                component: () => import(/* webpackChunkName: "alarm" */ '@/views/alarm/Alarm.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('alarm', 'delete')
                    }
                }
            });
        }
    }

    // 判断是否有权限
    private hasPermission(item: string, method: string) {
        if (!this.systemRoles[item]) {
            return false;
        }

        const permission: string | string[] = this.systemRoles[item][method];
        return permission === 'all'
            || permission === this.role
            || Array.isArray(permission)
            && permission.includes(this.role);
    }
}

