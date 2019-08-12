ALTER TABLE `pos_zone`   
  ADD COLUMN `mode` INT(11) NULL  COMMENT '区域类型' AFTER `enable`,
  ADD COLUMN `group_code` VARCHAR(255) NULL  COMMENT '切换区域关联组号' AFTER `mode`;
  
ALTER TABLE `pos_tag`   
  ADD COLUMN `properties` TEXT NULL  COMMENT '标签属性配置' AFTER `locked`;