/**
 * 配置及常量
 */
// 主题数据位置
export const MAP_THEME_URL: string = '/image';
// 地图数据位置
export const MAP_DATA_URL: string = '/image';

export const DEFAULT_WIDTH: number = 1600; // 屏幕默认宽度
export const SX_WIDTH: number = 768; // 小屏宽度

export const NOTICE_MAX: number = 5; // 同时出现的最大报警数
export const MISS_MSG: string = '信号丢失'; // 标签信号丢失时的报警信息
export const ERROR_IMG: string = '/images/error.png'; // 标签异常时的图片
export const BASE_ERROR_IMG: string = '/images/anchor-error.png'; // 基站异常时的图片

export const ZONE_SEPARATOR = '@#$$^*&(____^#@&(*||)(&..,';

// 全部权限
export const ALL_PERMISSION = <PermissionAll>{
    admin: { put: true, delete: true, post: true, get: true }, // 管理员
    zone: { put: true, delete: true, post: true, get: true }, // 区域(电子围栏)
    camera: { put: true, delete: true, post: true, get: true }, // 摄像机
    protocol: { put: true, delete: true, post: true, get: true }, // 协议
    base: { put: true, delete: true, post: true, get: true }, // 设备(基站)
    tag: { put: true, delete: true, post: true, get: true }, // 人员(标签)
    map: { put: true, delete: true, post: true, get: true }, // 地图(监控)
    alarm: { put: true, delete: true, post: true, get: true }, // 报警信息
    group: { put: true, delete: true, post: true, get: true }, // 分组
    bundle: { put: true, delete: true, post: true, get: true }, // 标签跟随/远离
    tagZone: { put: true, delete: true, post: true, get: true } // 标签-区域
};

export * from './config';
export * from './event';
