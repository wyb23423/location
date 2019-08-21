alter table `pos`.`pos_zone`   
  drop column `group_code`;
  
alter table `pos`.`pos_zone`   
  add column `base_no_1` varchar(255) null  comment '基站组号1' after `mode`,
  add column `base_no_2` varchar(255) null  comment '基站组号2' after `base_no_1`;