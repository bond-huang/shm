#!/bin/bash
# nginx_check.sh
NGINX_BIN="/usr/sbin/nginx"
NGINX_PORT="80"
LOG_FILE="/var/log/nginx_check.log"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# 日志打印函数
log_print(){
    echo "[$DATE] $1" >> $LOG_FILE
    echo "[$DATE] $1"
}

# 1. 检查nginx二进制文件是否存在
if [ ! -x $NGINX_BIN ];then
    log_print "ERROR: Nginx executable $NGINX_BIN not found"
    exit 1
fi

# 2. 检查配置文件语法
$NGINX_BIN -t >/dev/null 2>&1
if [ $? -ne 0 ];then
    log_print "ERROR: Nginx config file syntax error"
    exit 1
fi

# 3. 检查进程是否运行
PID=$(pidof nginx)
if [ -z "$PID" ];then
    log_print "ERROR: Nginx process not running, try starting"
    systemctl start nginx
    sleep 2
    PID=$(pidof nginx)
    if [ -z "$PID" ];then
        log_print "ERROR: Start nginx failed"
        exit 1
    else
        log_print "INFO: Nginx restart success, pid: $PID"
    fi
else
    log_print "INFO: Nginx running, pid: $PID"
fi

# 4. 检查监听端口是否开启
ss -tlnp | grep ":$NGINX_PORT" >/dev/null 2>&1
if [ $? -ne 0 ];then
    log_print "ERROR: Port $NGINX_PORT not listened by nginx"
    exit 1
fi

# 5. 简单页面连通性检测
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$NGINX_PORT | grep "200" >/dev/null 2>&1
if [ $? -eq 0 ];then
    log_print "INFO: Local access http://127.0.0.1:$NGINX_PORT return 200 OK"
else
    log_print "WARN: Local access not return 200"
fi

log_print "===== Check finished =====
"
exit 0