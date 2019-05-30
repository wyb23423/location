create table `pos_camera` (
  `id` int(11) not null auto_increment,
  `ip` varchar(255) default null comment 'ip地址',
  `port` text comment '端口号',
  `username` varchar(255) default null comment '用户名',
  `password` varchar(255) default null comment '密码',
  `dev_port` varchar(255) default null comment '设备端口',
  `window_split` varchar(255) default null comment '窗口分割数',
  `create_user` varchar(255) default null comment '录入人',
  `create_time` datetime default null comment '录入日期',
  `update_user` varchar(255) default null comment '修改人',
  `update_time` datetime default null comment '修改日期',
  primary key (`id`)
) engine=innodb default charset=utf8;


create table `pos_zone` (
  `id` int(11) not null auto_increment,
  `name` varchar(255) default null comment '区域名称',
  `position` text comment '区域坐标（json）',
  `enable` int(11) default null comment '是否启动',
  `create_user` varchar(255) default null comment '录入人',
  `create_time` datetime default null comment '录入日期',
  `update_user` varchar(255) default null comment '修改人',
  `update_time` datetime default null comment '修改日期',
  primary key (`id`)
) engine=innodb default charset=utf8