#!/bin/bash
# RHEL8 查看当日CPU占用前10进程

# 取今日零点时间戳
today_zero=$(date -d "$(date +%Y-%m-%d)" +%s)

ps -eo pid,user,%cpu,%mem,start_time,cmd --sort=-%cpu | awk -v zero="$today_zero" '
BEGIN {
    print sprintf("%-8s %-10s %-6s %-6s %-12s %s","PID","USER","CPU%","MEM%","START_TIME","COMMAND")
    print "------------------------------------------------------------------------------------------------"
    count=0
}
NR>1 {
    # 解析启动时间
    split($5,t,":")
    if (length($5)>=5 && t[1]!~/[A-Z]/){
        # 今天时分
        st_h=t[1]+0; st_m=t[2]+0; st_s=t[3]+0
        st_ts = zero + st_h*3600 + st_m*60 + st_s
    } else {
        # 不是今天启动，跳过
        next
    }
    # 只取前10
    if(count<10){
        printf "%-8s %-10s %-6s %-6s %-12s %.80s\n",$1,$2,$3,$4,$5,$6
        count++
    }
}
'