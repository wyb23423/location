// ============================================数据库表
declare interface IAdmin {
    username: string;
    name: string;
    password: string;
    sex: 0 | 1;
    department: string;
    job: string;
    phone: string;
    role: string; // 权限
}

declare interface IBaseStation {
    id: string;
    name: string;
    ip: string;
    main: boolean;
    groupId: string;
    mapId: number;
    timeCorrectionValue: string; // 补偿值。多个用英文逗号隔开
    coordx: number;
    coordy: number;
    coordz: number;
    installTime: string | number;
    description: string;
    location: string;
    owner: string; // 安装负责人
}

declare interface ICamera {
    ip: string;
    name: string;
    port: number; // 设备端口号
    groupCode: string;
    username: string;
    password: string;
    windowSplit: string; // 窗口分割数
}

declare interface IMap<T extends string | number[][] = number[][]> {
    id: number;
    name: string;
    margin: T; // 地图边界值[左下, 左上, 右上, 右下, [监控区域宽, 监控区域高]]
    filepath: string; // 地图文件。背景图或.fmap
    groupIds: string[]; // 关联的基站分组
}

declare interface IProtocol {
    name: string;
    effect: string; // 协议作用
    content: string; // 协议内容。一个协议命令串
    port: number; // 协议对应的端口。现为 50000 或 60000
}

declare interface ITag {
    id: string;
    name: string;
    type: 1 | 2; // 标签类型。1——常驻，2——临时
    img: string; // 头像
    icon: string; // 图标
    content: string;
}

declare interface IZone {
    id: number;
    name: string;
    position: string | VectorAxis[]; // 区域边界点
    enable: 0 | 1; // 是否启用
    mapId: number;
    mode: number; // 区域类型
    groupId1: string;
    groupId2: string;
}

declare interface IBingdings<T = Pick<ITag, 'id' | 'name'>> {
    id: number;
    name: string;
    bundle: T[];
    main: T;
    type: 0 | 1; // 0:跟随报警,1:靠近报警
    radius: number;
    detail: string;
}

declare interface IGroup {
    id: string;
    size: number; // 最大基站数
    min: number; // 最小基站数
    algorithmType: number; // 算法类型
    description: string;
    mapId: number;
    channel: number;
}

declare interface IAlarm {
    id: number;
    deviceId: string;
    type: number;
    content: string;
    time: number;
}

declare interface ITagZone {
    id: number;
    tagId: string;
    zoneId: number;
    type: 1 | 2;
    tagName: string;
    zoneName?: string;
}

// ==========================================
declare type TPosition = [Vector2, Vector2, Vector2, Vector2];
declare interface VectorAxis {
    xaxis: number;
    yaxis: number;
    zaxis: number;
}

declare interface IJson {
    [x: string]: any;
}


// 请求参数
declare interface RequestParams {
    url: string;
    params?: Record<string, any>;
    body?: Record<string, any>;
    data?: Record<string, any>;
    headers?: Record<string, any> | Headers;
    controller?: AbortController; // 用于中止请求
}
// 响应数据
declare interface ResponseData<T = any, K = any> {
    code: number;
    message: string;
    pagedData: {
        currentPage: number;
        datas: T[];
        pageSize: number;
        totalCount: number;
    };
    resultMap: K;
    success: boolean;
}

declare interface Permission {
    delete?: boolean;
    post?: boolean;
    put?: boolean;
    get?: boolean;
}

declare interface ITagInfo {
    groupNo: string;
    iBattery: number;
    alarm: string;
    iHeartRate: number;
    position: string[];
    sTagNo: string;
    static: boolean;
    time?: string;
}

declare interface Configuration {
    APP_KEY: string;
    APP_NAME: string;
    SECOND_COUNT: number;
    PROXY_TARGET: string;
    websoket: {
        position: string;
        sundries: string;
    };
}
