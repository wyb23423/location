/**
 * 权限相关
 */
import { RouteConfig, Route } from 'vue-router/types/router';
import { ALL_PERMISSION } from '@/constant';

export class RouteList {
    public routes: RouteConfig[] = [];
    private roles: IJson = ALL_PERMISSION;

    constructor() {
        const user = sessionStorage.getItem('user');
        if (user) {
            try {
                this.roles = JSON.parse(JSON.parse(user).role);
            } catch (e) {
                //
            }
        }
        this.roles.tag = this.roles.tag || this.roles.people;

        ['admin', 'system', 'base', 'tag', 'map', 'alarm'].forEach(v => {
            Reflect.get(this, v).call(this);
        });
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
                        put: this.hasPermission('admin', 'put')
                    }
                }
            });
        }

        if (this.hasPermission('admin', 'post')) {
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
        const routes: RouteConfig[] = ['zone', 'camera', 'protocol', 'group'].map(k => {
            const func = Reflect.get(this, k);
            return func.call(this);
        }).flat();

        routes.push({
            path: 'bind', name: 'bind',
            component: () => import(/* webpackChunkName: "system" */ '@/views/system/Bind.vue')
        });

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
    public zone() {
        const getPermission = this.hasPermission('zone', 'get');
        const putPermission = this.hasPermission('zone', 'post');
        if (putPermission || getPermission) {
            return [{
                path: 'zone',
                name: 'zone',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/Zone.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('zone', 'delete'),
                        put: this.hasPermission('zone', 'put'),
                        post: putPermission,
                        get: getPermission
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
                        put: this.hasPermission('camera', 'put')
                    }
                }
            });
        }

        if (this.hasPermission('camera', 'post')) {
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

        if (this.hasPermission('protocol', 'post')) {
            routes.push({
                path: 'protocol/add',
                name: 'protocol-add',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/protocol/ProtocolAdd.vue')
            });
        }

        if (this.hasPermission('protocol', 'put')) {
            routes.push({
                path: 'protocol/submissio',
                name: 'protocol-submissio',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/protocol/Submissio.vue')
            });
        }

        return routes;
    }
    // 分组
    public group() {
        return [
            {
                path: 'group/list',
                name: 'group-list',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/group/GroupList.vue')
            },
            {
                path: 'group/add',
                name: 'group-add',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/group/GroupAdd.vue')
            }
        ];
    }

    // 设备
    public base() {
        const putPermission = this.hasPermission('base', 'put');
        const routes: RouteConfig[] = [];

        if (this.hasPermission('base', 'get')) {
            routes.push({
                path: 'info', alias: '', name: 'base-info',
                component: () => import(/* webpackChunkName: "base" */ '@/views/base/Info.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('base', 'delete'),
                        put: putPermission
                    }
                }
            });
        }

        if (this.hasPermission('base', 'post')) {
            routes.push({
                path: 'add', name: 'base-add',
                component: () => import(/* webpackChunkName: "base" */ '@/views/base/BaseAdd.vue')
            });
        }

        if (putPermission) {
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

    // 标签管理
    public tag() {
        const routes: RouteConfig[] = [
            {
                path: 'tagzone', name: 'tagzone',
                component: () => import(/* webpackChunkName: "tag" */ '@/views/tag/TagZone.vue')
            }
        ];

        let redirect = '';
        if (this.hasPermission('tag', 'get')) {
            routes.push({
                path: 'list/:type',
                name: 'tag-list',
                component: () => import(/* webpackChunkName: "tag" */ '@/views/tag/TagList.vue'),
                props: (route: Route) => ({
                    type: route.params.type,
                    permission: {
                        delete: this.hasPermission('admin', 'delete'),
                        put: this.hasPermission('admin', 'put')
                    }
                })
            });
            redirect = 'tag/list/1';
        }

        if (this.hasPermission('tag', 'post')) {
            routes.push({
                path: 'add', name: 'tag-add',
                component: () => import(/* webpackChunkName: "tag" */ '@/views/tag/TagAdd.vue')
            });
            redirect = redirect || '/tag/add';
        }

        if (routes.length) {
            this.routes.push({
                path: 'tag', redirect, name: 'tag',
                component: () => import(/* webpackChunkName: "tag" */ '@/views/tag/TagIndex.vue'),
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

        if (this.hasPermission('map', 'post')) {
            routes.push({
                path: 'add', name: 'map-add',
                component: () => import(/* webpackChunkName: "map" */ '@/views/map/MapAdd.vue')
            });
        }

        const putPermission = this.hasPermission('map', 'put');
        const deletePermission = this.hasPermission('map', 'delete');
        if (putPermission || deletePermission) {
            routes.push({
                path: 'edit', name: 'map-edit',
                component: () => import(/* webpackChunkName: "map" */ '@/views/map/MapUpdate.vue'),
                props: {
                    permission: {
                        delete: deletePermission,
                        put: putPermission
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
        return this.roles[item]
            && (this.roles[item][method]
                || Array.isArray(this.roles[item]) && this.roles[item].includes(method)
            );
    }
}

