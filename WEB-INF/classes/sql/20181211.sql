CREATE TABLE `pos_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '地图名称',
  `filepath` text COMMENT '地图文件地址',
  `x_min` double DEFAULT NULL COMMENT 'X轴最小值',
  `x_max` double DEFAULT NULL COMMENT 'X轴最大值',
  `y_min` double DEFAULT NULL COMMENT 'Y轴最小值',
  `y_max` double DEFAULT NULL COMMENT 'Y轴最大值',
  `create_user` varchar(255) DEFAULT NULL COMMENT '录入人',
  `create_time` datetime DEFAULT NULL COMMENT '录入日期',
  `update_user` varchar(255) DEFAULT NULL COMMENT '修改人',
  `update_time` datetime DEFAULT NULL COMMENT '修改日期',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
