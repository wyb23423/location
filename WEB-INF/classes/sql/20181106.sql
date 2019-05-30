ALTER TABLE pos_base_station ADD COLUMN `group_base_size` INT NULL AFTER `group_code`;

CREATE TABLE `pos_admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_lithuanian_ci DEFAULT NULL COMMENT '用户姓名',
  `user_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_lithuanian_ci DEFAULT NULL COMMENT '管理者名称(登录名)',
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_lithuanian_ci DEFAULT NULL COMMENT '密码',
  `sex` int(11) DEFAULT NULL COMMENT '性别',
  `department` varchar(255) CHARACTER SET utf8 COLLATE utf8_lithuanian_ci DEFAULT NULL COMMENT '部门',
  `job` varchar(255) DEFAULT NULL COMMENT '职位',
  `level` varchar(255) DEFAULT NULL COMMENT '等级',
  `phone` varchar(255) CHARACTER SET utf8 COLLATE utf8_lithuanian_ci DEFAULT NULL COMMENT '电话号码',
  `work_no` varchar(255) CHARACTER SET utf8 COLLATE utf8_lithuanian_ci DEFAULT NULL COMMENT '工号',
  `role` text CHARACTER SET utf8 COLLATE utf8_lithuanian_ci COMMENT '权限',
  `create_user` varchar(255) CHARACTER SET utf8 COLLATE utf8_lithuanian_ci DEFAULT NULL COMMENT '录入人',
  `create_time` datetime DEFAULT NULL COMMENT '录入日期',
  `update_user` varchar(255) CHARACTER SET utf8 COLLATE utf8_lithuanian_ci DEFAULT NULL COMMENT '修改人',
  `update_time` datetime DEFAULT NULL COMMENT '修改日期',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

