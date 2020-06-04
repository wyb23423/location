/**
 * 权限路由
 */
import { RouteConfig, Route } from 'vue-router/types/router';
import { ALL_PERMISSION } from '@/constant';

export class RouteList {
    public routes: RouteConfig[] = [];
    private roles = ALL_PERMISSION;

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

        const nav = ['admin', 'system', 'device', 'monitor'];
        nav.forEach(v => Reflect.get(this, v).call(this));
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
        const nav = ['map', 'group', 'zone', 'protocol',];
        const routes: RouteConfig[] = nav.map(k => {
            const func = Reflect.get(this, k);
            return func.call(this);
        }).flat();

        if (this.hasPermission('base', 'post')) {
            routes.push(
                {
                    path: 'calibration', name: 'calibration',
                    component: () => import(/* webpackChunkName: "base" */ '@/views/system/Calibration.vue')
                },
            );
        }
        routes.push({
            path: 'qrcode', name: 'base-qrcode',
            component: () => import(/* webpackChunkName: "base" */ '@/views/system/QRcodeCreate.vue'),
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
    // 地图
    public map() {
        const routes: RouteConfig[] = [];

        const postPermission = this.hasPermission('map', 'post');
        const deletePermission = this.hasPermission('map', 'delete');
        if (postPermission || deletePermission) {
            routes.push({
                path: 'map/edit', name: 'map-edit',
                component: () => import(/* webpackChunkName: "map" */ '@/views/system/map/MapUpdate.vue'),
                props: {
                    permission: {
                        delete: deletePermission,
                        post: postPermission
                    }
                }
            });
        }

        if (this.hasPermission('map', 'put')) {
            routes.push({
                path: 'map/add', name: 'map-add',
                component: () => import(/* webpackChunkName: "map" */ '@/views/system/map/MapAdd.vue')
            });
        }

        return routes;
    }
    // 分组
    public group() {
        const routes: RouteConfig[] = [];
        if (this.hasPermission('group', 'get')) {
            routes.push({
                path: 'group/list',
                name: 'group-list',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/group/GroupList.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('group', 'delete'),
                        post: this.hasPermission('group', 'post')
                    }
                }
            });
        }

        if (this.hasPermission('group', 'put')) {
            routes.push({
                path: 'group/add',
                name: 'group-add',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/group/GroupAdd.vue')
            });
        }

        return routes;
    }
    // 区域
    public zone() {
        const getPermission = this.hasPermission('zone', 'get');
        const putPermission = this.hasPermission('zone', 'put');
        if (putPermission || getPermission) {
            return [{
                path: 'zone',
                name: 'zone',
                component: () => import(/* webpackChunkName: "system" */ '@/views/system/zone/Zone.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('zone', 'delete'),
                        put: putPermission,
                        post: this.hasPermission('zone', 'post'),
                        get: getPermission
                    }
                }
            }];
        }

        return [];
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

        routes.push({
            path: 'protocol/submissio',
            name: 'protocol-submissio',
            component: () => import(/* webpackChunkName: "system" */ '@/views/system/protocol/Submissio.vue')
        });

        return routes;
    }

    // ========================================================设备
    public device() {
        const nav = ['base', 'tag', 'camera'];
        const routes: RouteConfig[] = nav.map(k => {
            const func = Reflect.get(this, k);
            return func.call(this);
        }).flat();

        if (routes.length) {
            routes[0].alias = '';
            this.routes.push({
                path: 'device',
                name: 'device',
                component: () => import(/* webpackChunkName: "system" */ '@/views/device/Device.vue'),
                children: routes
            });
        }
    }
    public base() {
        const postPermission = this.hasPermission('base', 'post');
        const routes: RouteConfig[] = [];

        if (this.hasPermission('base', 'get')) {
            routes.push({
                path: 'base/info', alias: '', name: 'base-info',
                component: () => import(/* webpackChunkName: "base" */ '@/views/device/base/Info.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('base', 'delete'),
                        post: postPermission
                    }
                }
            });
        }

        if (this.hasPermission('base', 'put')) {
            routes.push(
                {
                    path: 'base/add', name: 'base-add-all',
                    component: () => import(/* webpackChunkName: "base" */ '@/views/device/base/BaseAdd.vue')
                }
            );
        }

        if (postPermission) {
            routes.push(
                {
                    path: 'base/batch', name: 'batch',
                    component: () => import(/* webpackChunkName: "base" */ '@/views/device/base/Batch.vue')
                },
            );
        }

        return routes;
    }
    public tag() {
        const routes: RouteConfig[] = [...this.tagZone()];

        if (this.hasPermission('tag', 'get')) {
            routes.push({
                path: 'tag/list/:type',
                name: 'tag-list',
                component: () => import(/* webpackChunkName: "tag" */ '@/views/device/tag/TagList.vue'),
                props: (route: Route) => ({
                    type: route.params.type,
                    permission: {
                        delete: this.hasPermission('tag', 'delete'),
                        post: this.hasPermission('tag', 'post')
                    }
                })
            });
        }

        if (this.hasPermission('tag', 'put')) {
            routes.push(
                {
                    path: 'tag/add', name: 'tag-add',
                    component: () => import(/* webpackChunkName: "tag" */ '@/views/device/tag/TagAdd.vue')
                },
                {
                    path: 'tag/import', name: 'tag-import',
                    component: () => import(/* webpackChunkName: "tag" */ '@/views/device/tag/TagImport.vue')
                }
            );
        }

        return routes;
    }
    // 摄像机
    public camera() {
        const routes: RouteConfig[] = [];
        if (this.hasPermission('camera', 'get')) {
            routes.push({
                path: 'camera/list',
                name: 'camera-list',
                component: () => import(/* webpackChunkName: "system" */ '@/views/device/camera/CameraList.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('camera', 'delete'),
                        post: this.hasPermission('camera', 'post')
                    }
                }
            });
        }

        if (this.hasPermission('camera', 'post')) {
            routes.push({
                path: 'camera/add',
                name: 'camera-add',
                component: () => import(/* webpackChunkName: "system" */ '@/views/device/camera/CameraAdd.vue')
            });
        }

        return routes;
    }
    // =================================================================监控
    public monitor() {
        const routes: RouteConfig[] = [];
        if (this.hasPermission('map', 'get')) {
            routes.push(
                {
                    path: 'realTime', name: 'monitor',
                    component: () => import(/* webpackChunkName: "map" */ '@/views/monitor/RealTime.vue')
                },
                {
                    path: 'history', name: 'history',
                    component: () => import(/* webpackChunkName: "map" */ '@/views/monitor/History.vue')
                },
            );
        }

        if (this.hasPermission('tag', 'get') || this.hasPermission('camera', 'get')) {
            routes.push({
                path: 'video', name: 'video',
                component: () => import(/* webpackChunkName: "map" */ '@/views/monitor/Video.vue')
            });
        }

        routes.push(...this.bundle());
        if (this.hasPermission('alarm', 'get')) {
            routes.push({
                path: 'alarm', name: 'alarm',
                component: () => import(/* webpackChunkName: "alarm" */ '@/views/monitor/Alarm.vue'),
                props: {
                    permission: {
                        delete: this.hasPermission('alarm', 'delete')
                    }
                }
            });
        }

        if (routes.length) {
            routes[0].alias = '';
            this.routes.push({
                path: 'monitor',
                name: 'monitor',
                component: () => import(/* webpackChunkName: "system" */ '@/views/monitor/Monitor.vue'),
                children: routes
            });
        }
    }

    // ==============================================================
    // 跟随
    private bundle() {
        const getPermission = this.hasPermission('bundle', 'get');
        const putPermission = this.hasPermission('bundle', 'put');

        if (!(getPermission && putPermission)) {
            return [];
        }

        return [{
            path: 'bind', name: 'bind',
            component: () => import(/* webpackChunkName: "system" */ '@/views/monitor/Bind.vue'),
            props: {
                permission: {
                    delete: this.hasPermission('bundle', 'delete'),
                    post: this.hasPermission('bundle', 'post'),
                    get: getPermission,
                    put: putPermission
                }
            }
        }];
    }

    // 标签权限（区域）
    private tagZone() {
        const getPermission = this.hasPermission('tagZone', 'get');
        const putPermission = this.hasPermission('tagZone', 'put');

        if (!(getPermission && putPermission)) {
            return [];
        }

        return [{
            path: 'tag/tagzone', name: 'tagzone',
            component: () => import(/* webpackChunkName: "tag" */ '@/views/device/tag/TagZone.vue'),
            props: {
                permission: {
                    delete: this.hasPermission('tagZone', 'delete'),
                    post: this.hasPermission('tagZone', 'post'),
                    get: getPermission,
                    put: putPermission
                }
            }
        }];
    }

    // 判断是否有权限
    private hasPermission(item: PermissionKeys, method: keyof Permission) {
        return this.roles[item] && this.roles[item][method];
    }
}

export default function getRoutes() {
    return new RouteList().routes;
}
