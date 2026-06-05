-- SHM 初始数据
USE shm;

-- 用户数据 (密码: 123456, bcrypt 加密)
INSERT INTO users (username, password, nickname, role) VALUES
('admin', '$2b$10$.zzpE39Zg7Ste1jfeMdCA.35ktDMwZEiUw/0Hij1uvXEGBczyMjyC', 'admin', 'admin');

-- 菜单数据
INSERT INTO menus (menu_id, parent_id, menu_type, menu_name, path, sort_order) VALUES
('1-1', NULL, 1, 'AIX system', NULL, 1),
('1-1-1', '1-1', 2, 'AIXtest1', '/aixsystems/AIXtest1', 1),
('1-1-2', '1-1', 2, 'AIXtest2', '/allsystems', 2),
('1-2', NULL, 1, 'Linux system', NULL, 2),
('1-2-1', '1-2', 2, 'Linuxtest1', '/allsystems', 1),
('1-2-2', '1-2', 2, 'Linuxtest2', '/allsystems', 2);

-- 主机数据 (与 mock 数据一致)
INSERT INTO hosts (id, host_type, host_name, ip_address, description, status_info) VALUES
(1, 'AIX', 'AIXtest1', '192.168.100.100', 'IBM AIX test system', 'Health'),
(2, 'AIX', 'AIXtest2', '192.168.100.101', 'IBM AIX test system', 'Warning'),
(3, 'AIX', 'AIXtest3', '192.168.100.102', 'IBM AIX test system', 'Health'),
(4, 'AIX', 'AIXtest4', '192.168.100.103', 'IBM AIX test system', 'Severe'),
(5, 'AIX', 'AIXtest5', '192.168.100.104', 'IBM AIX test system', 'Health'),
(6, 'AIX', 'AIXtest6', '192.168.100.105', 'IBM AIX test system', 'Health'),
(7, 'AIX', 'AIXtest7', '192.168.100.106', 'IBM AIX test system', 'Health'),
(8, 'Linux', 'Linuxtest1', '192.168.100.107', 'Red Hat Enterprise Linux', 'Health'),
(9, 'Linux', 'Linuxtest2', '192.168.100.108', 'Red Hat Enterprise Linux', 'Health'),
(10, 'Linux', 'Linuxtest3', '192.168.100.109', 'Red Hat Enterprise Linux', 'Health'),
(11, 'Linux', 'Linuxtest4', '192.168.100.110', 'Red Hat Enterprise Linux', 'Health'),
(12, 'Linux', 'Linuxtest5', '192.168.100.111', 'Red Hat Enterprise Linux', 'Health');

-- CPU 性能数据 (AIXtest1 的模拟数据，与 mock 一致)
INSERT INTO cpu_performance (host_id, metric_name, metric_date,
  hour_0, hour_1, hour_2, hour_3, hour_4, hour_5,
  hour_6, hour_7, hour_8, hour_9, hour_10, hour_11,
  hour_12, hour_13, hour_14, hour_15, hour_16, hour_17,
  hour_18, hour_19, hour_20, hour_21, hour_22, hour_23) VALUES
(1, 'user', CURDATE(), 3,28,32,34,12,10,11,9,8,18,14,12,13,10,13,9,23,21,16,14,13,15,17,14),
(1, 'sys', CURDATE(), 8,14,18,16,10,9,9,6,7,13,15,22,18,19,23,29,33,31,21,17,14,19,11,9),
(1, 'idle', CURDATE(), 89,58,50,50,78,81,80,85,85,69,71,66,69,71,64,62,44,48,63,69,73,66,72,77),
(1, 'iowait', CURDATE(), 1,7,8,6,8,5,6,3,2,3,1,1,0,3,0,2,1,3,7,4,1,4,2,1),
(1, 'entc', CURDATE(), 11,42,50,50,22,19,20,15,15,31,29,34,31,29,36,38,56,52,37,31,27,34,28,23);
