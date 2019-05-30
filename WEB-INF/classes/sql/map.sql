USE `pos`;

CREATE TABLE `pos_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '地图名称',
  `margin` varchar(1024) DEFAULT NULL COMMENT '地图边缘坐标',
  `filepath` varchar(1024) DEFAULT NULL COMMENT '地图文件地址',
  `create_user` varchar(255) DEFAULT NULL COMMENT '录入人',
  `create_time` datetime DEFAULT NULL COMMENT '录入日期',
  `update_user` varchar(255) DEFAULT NULL COMMENT '修改人',
  `update_time` datetime DEFAULT NULL COMMENT '修改日期',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;