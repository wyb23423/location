/**
 * 服务器接口
 */

export const ADD_ZONE = '/api/zone/addZone'; // 添加区域
export const RM_ZONE = '/api/zone/deleteZone'; // 删除区域
export const UPDATE_ZONE = '/api/zone/updateZone'; // 更新区域
export const GET_ZONE = '/api/zone/getall'; // 获取区域数据

export const ADD_MAP = '/api/map/addMap'; // 添加地图
export const RM_MAP = '/api/map/deleteMap'; // 删除地图
export const UPDATE_MAP = '/api/map/updateMap'; // 更新地图
export const GET_MAP = '/api/map/getall'; // 获取地图数据
export const UPLOAD_MAPFILE = '/api/map/upload/mapfile'; // 上传地图文件

export const ADD_TAG = '/api/tag/addTag'; // 添加标签
export const RM_TAG = '/api/tag/deleteTag'; // 删除标签
export const UPDATE_TAG = '/api/tag/updateTag'; // 更新标签
export const GET_TAG = '/api/tag/getall'; // 获取标签数据
export const GET_HISTORY = '/api/tag/queryTagHistory'; // 获取标签历史轨迹
export const GET_INSTANT = '/api/tag/queryInstantInMap'; // 获取一个时刻所有标签的历史位置
export const UPLOAD_TAGPHOTO = '/api/tag/upload/tagPhoto'; // 上传标签图

export const ADD_TAG_ZONE = '/api/tagZone/addTagZone'; // 添加标签与区域关系
export const RM_TAG_ZONE = '/api/tagZone/deleteTagZone'; // 删除标签与区域关系
export const UPDATE_TAG_ZONE = '/api/tagZone/updateTagZone'; // 更新标签与区域关系
export const GET_TAG_ZONE = '/api/tagZone/getall'; // 获取标签与区域关系数据

export const ADD_ADMIN = '/api/admin/addAdmin'; // 添加管理员
export const RM_ADMIN = '/api/admin/deleteAdmin'; // 删除管理员
export const UPDATE_ADMIN = '/api/admin/updateAdmin'; // 更新管理员
export const GET_ADMIN = '/api/admin/getall'; // 获取管理员数据

export const RM_ALARM = '/api/alarm/deleteAlarm'; // 删除报警
export const GET_ALARM = '/api/alarm/getall'; // 获取报警数据

export const ADD_BASE = '/api/base/addBase'; // 添加基站
export const RM_BASE = '/api/base/deleteBase'; // 删除基站
export const UPDATE_BASE = '/api/base/updateBase'; // 更新基站
export const GET_BASE = '/api/base/getall'; // 获取基站数据
export const GET_COMPENSATION = '/api/compensation/group'; // 计算一组基站的补偿值

export const ADD_GROUP = '/api/group/addGroup'; // 添加分组
export const RM_GROUP = '/api/group/deleteGroup'; // 删除分组
export const UPDATE_GROUP = '/api/group/updateGroup'; // 更新分组
export const GET_GROUP = '/api/group/getall'; // 获取分组数据

export const ADD_CAMERA = '/api/camera/addCamera'; // 添加摄像机
export const RM_CAMERA = '/api/camera/deleteCamera'; // 删除摄像机
export const GET_CAMERA = '/api/camera/getall'; // 获取摄像机数据

export const ADD_PROTOCOL = '/api/protocol/addProtocol'; // 添加协议
export const RM_PROTOCOL = '/api/protocol/deleteProtocol'; // 删除协议
export const GET_PROTOCOL = '/api/protocol/getall'; // 获取协议数据
export const SEND_PROTOCOL = '/api/protocol/sendProtocol'; // 下发协议
export const SEND_RECEIVE = '/api/protocol/sendReceive'; // 下发协议并获取回复

export const BIND_CONTROLLER = '/api/bundle'; // 标签绑定相关
export const GET_BIND = '/api/bundle/getAll'; // 获取标签绑定数据

export const LOGIN = '/api/admin/login'; // 登录
export const LOGOUT = '/api/admin/logout'; // 登出
