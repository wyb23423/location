
interface DataBase extends IJson {
    id: number;
    createUser?: string;
    createTime?: string | number;
    updateUser?: string;
    updateime?: string | number;
}

// ============================================数据库表

declare interface IAdmin extends DataBase {
    adminName: string;
    userName: string;
    password: string;
    sex: 0 | 1;
    department: string;
    job: string;
    level: string;
    phone: string;
    workNo: string; // 工号
    role: string; // 权限
}

declare interface IBaseStation extends DataBase {
    baseNo: string;
    groupCode: string;
    ip: string;
    main: 0 | 1;
    algorithmType: number; // 算法类型
    timeCorrectionValue: string; // 补偿值。多个用英文逗号隔开
    coordx: number;
    coordy: number;
    coordz: number;
    groupBaseSize: number; // 分组内的基站总数
    minBaseSize: number; // 分组所包含的最小基站数
    name: string;
    installTime: string | number;
    description: string;
    uploadType: number; // 上传类型
    location: string; // 地址
    zone: string; // 所在区域
    owner: string; // 安装负责人
    work: 0 | 1; // 是否工作
    loseRate: number; // 掉帧率
    alarm: number; // 报警次数
}

declare interface ICamera extends DataBase {
    ip: string;
    name: string;
    port: number; // 设备端口号
    groupCode: string;
    username: string;
    password: string;
    windowSplit: string; // 窗口分割数
}

declare interface IMap extends DataBase {
    name: string;
    margin: string | number[][]; // 地图边界值[左下, 左上, 右上, 右下, [监控区域宽, 监控区域高]]
    groupCode: string;
    filepath: string; // 地图文件。背景图或.fmap
}

declare interface IProtocol extends DataBase {
    name: string;
    effect: string; // 协议作用
    content: string; // 协议内容。一个协议命令串
    port: number; // 协议对应的端口。现为 50000 或 60000
}

declare interface ITag extends DataBase {
    name: string;
    tagNo: string;
    type: 1 | 2; // 标签类型。1——常驻，2——临时
    sex: 0 | 1;
    avatar: string; // 头像
    photo: string; // 图标
    department: string;
    job: string;
    zone: string;
    level: string;
    phone: string;
    leader: string;
    reason: string; // 临时添加原因
    locked: 0 | 1;
}

declare interface IZone extends DataBase {
    name: string;
    position: string | TPosition; // 区域边界点
    enable: 0 | 1; // 是否启用
}

declare interface IAlarm extends IJson {
    id: number;
    baseNo: string;
    tagNo: string;
    type: number;
    alarmTime: number | string;
    alarmMsg: string;
}

// ==========================================
declare type TPosition = [Vector2, Vector2, Vector2, Vector2];

declare interface IJson {
    [x: string]: any;
}

// 请求参数
declare interface RequestParams {
    url: string;
    params?: any;
    body?: any;
    data?: any;
    headers?: any;
}
// 响应数据
declare interface ResponseData {
    code: number;
    message: string;
    pagedData: {
        currentPage: number;
        datas: any[];
        pageSize: number;
        totalCount: number;
    };
    resultMap: IJson;
    success: boolean;
}

declare interface Permission {
    delete?: boolean;
    post?: boolean;
    put?: boolean;
    get?: boolean;
}

declare interface ITagInfo {
    sGroupNo: string;
    iBbattery: number;
    alarm: string;
    iHeartRate: number;
    position: string[];
    sTagNo: string;
    time?: string;
}
