alter table pos_base_station 
  add column `min_base_size` int null comment '最少需要上报的基站数量' after `group_code`,
  change `group_base_size` `group_base_size` int (11) null comment '分组基站数量' ;