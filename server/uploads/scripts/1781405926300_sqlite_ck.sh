#!/bin/bash
# SQLite3 指定目录巡检脚本：/home/navusr/navigator/instance
# 固定扫描路径，无需传参

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 固定数据库扫描目录
SCAN_PATH="/home/navusr/navigator/instance"
LOG_FILE="./sqlite_inspect_$(date +%Y%m%d_%H%M%S).log"

# 检测sqlite3是否安装
if ! command -v sqlite3 &> /dev/null; then
    echo -e "${RED}错误：系统未安装sqlite3工具${NC}"
    echo "CentOS/RHEL：yum install sqlite -y"
    echo "Debian/Ubuntu：apt install sqlite3 -y"
    exit 1
fi

# 判断目录是否存在
if [ ! -d "$SCAN_PATH" ];then
    echo -e "${RED}错误：目录 $SCAN_PATH 不存在${NC}"
    exit 1
fi

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}        SQLite 定点巡检启动 $(date)${NC}"
echo -e "${BLUE}扫描目录：$SCAN_PATH${NC}"
echo -e "${BLUE}日志保存路径：$LOG_FILE${NC}"
echo -e "${BLUE}====================================================${NC}"

# 初始化日志头
cat > "$LOG_FILE" << EOF
====================================================
SQLite定点巡检日志
执行时间: $(date)
扫描路径: $SCAN_PATH
====================================================
EOF

# 查找目录下所有.db文件（包含子目录）
DB_LIST=$(find "$SCAN_PATH" -type f -name "*.db")

if [ -z "$DB_LIST" ]; then
    echo -e "${YELLOW}目录内未找到任何后缀为.db的SQLite数据库文件${NC}"
    echo "扫描结果：无db文件" >> "$LOG_FILE"
    echo -e "${BLUE}巡检结束${NC}"
    exit 0
fi

DB_COUNT=$(echo "$DB_LIST" | wc -l)
echo -e "${GREEN}共检索到 ${DB_COUNT} 个db文件，开始逐项检测${NC}"
echo ""

# 循环检测每一个数据库文件
echo "$DB_LIST" | while read -r DB_FILE; do
    echo -e "${GREEN}>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>${NC}"
    echo -e "${GREEN}数据库文件：$DB_FILE${NC}"
    echo "==================== $DB_FILE ====================" >> "$LOG_FILE"

    # 1.基础文件属性
    FILE_SIZE_H=$(du -h "$DB_FILE" | awk '{print $1}')
    FILE_SIZE_BYTE=$(du -b "$DB_FILE" | awk '{print $1}')
    MODIFY_TIME=$(stat -c "%y" "$DB_FILE")
    FILE_PERM=$(ls -lh "$DB_FILE" | awk '{print $1,$3,$4}')

    echo "【基础文件信息】"
    echo "大小：$FILE_SIZE_H | 权限属主：$FILE_PERM | 修改时间：$MODIFY_TIME"
    echo "字节大小：$FILE_SIZE_BYTE 权限：$FILE_PERM 修改时间：$MODIFY_TIME" >> "$LOG_FILE"

    # 读写权限校验
    if [ ! -r "$DB_FILE" ];then
        echo -e "${RED}  严重风险：文件不可读，无法校验库内容${NC}"
        echo "风险：文件无读取权限" >> "$LOG_FILE"
        continue
    fi
    if [ ! -w "$DB_FILE" ];then
        echo -e "${YELLOW}  警告：文件无写入权限${NC}"
        echo "警告：无写入权限" >> "$LOG_FILE"
    fi

    # 2.核心完整性校验
    INTEG_CHECK=$(sqlite3 "$DB_FILE" "PRAGMA integrity_check;")
    echo "【完整性校验结果】$INTEG_CHECK"
    echo "完整性校验：$INTEG_CHECK" >> "$LOG_FILE"
    if [ "$INTEG_CHECK" != "ok" ];then
        echo -e "${RED}  故障警告：数据库存在损坏、坏页、结构异常${NC}"
        echo "严重：数据库文件损坏" >> "$LOG_FILE"
    fi

    # 3.存储模式、页信息、碎片计算
    WAL_MODE=$(sqlite3 "$DB_FILE" "PRAGMA journal_mode;")
    LOCK_MODE=$(sqlite3 "$DB_FILE" "PRAGMA locking_mode;")
    PAGE_SIZE=$(sqlite3 "$DB_FILE" "PRAGMA page_size;")
    TOTAL_PAGE=$(sqlite3 "$DB_FILE" "PRAGMA page_count;")
    FREE_PAGE=$(sqlite3 "$DB_FILE" "PRAGMA freelist_count;")

    echo "【存储配置】日志模式：$WAL_MODE 锁模式：$LOCK_MODE"
    echo "页大小：$PAGE_SIZE 总页数：$TOTAL_PAGE 空闲页：$FREE_PAGE"
    echo "日志模式:$WAL_MODE 锁:$LOCK_MODE 页大小:$PAGE_SIZE 总页:$TOTAL_PAGE 空闲页:$FREE_PAGE" >> "$LOG_FILE"

    # 碎片率
    if [ "$TOTAL_PAGE" -gt 0 ];then
        FRAG_RATE=$(echo "scale=2;$FREE_PAGE*100/$TOTAL_PAGE" | bc)
        echo "碎片率：${FRAG_RATE}%"
        echo "碎片率：${FRAG_RATE}%" >> "$LOG_FILE"
        if (( $(echo "$FRAG_RATE > 20" | bc -l) ));then
            echo -e "${YELLOW}  优化提示：碎片过高，建议执行VACUUM清理${NC}"
            echo "提示：碎片偏高，需vacuum优化" >> "$LOG_FILE"
        fi
    fi

    # 4.表、索引数量统计
    TABLE_NUM=$(sqlite3 "$DB_FILE" "SELECT count(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    INDEX_NUM=$(sqlite3 "$DB_FILE" "SELECT count(*) FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';")
    echo "【对象统计】业务表：$TABLE_NUM 索引：$INDEX_NUM"
    echo "业务表:$TABLE_NUM 索引:$INDEX_NUM" >> "$LOG_FILE"

    # 5.全库总记录数
    ALL_ROWS=0
    TB_LIST=$(sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    for tb in $TB_LIST;do
        row_cnt=$(sqlite3 "$DB_FILE" "SELECT count(*) FROM [$tb];")
        ALL_ROWS=$((ALL_ROWS + row_cnt))
    done
    echo "全库总数据行数：$ALL_ROWS"
    echo "总记录行数：$ALL_ROWS" >> "$LOG_FILE"

    # 6.检测WAL、shm临时文件（判断是否有进程占用）
    WAL_FILE="${DB_FILE}-wal"
    SHM_FILE="${DB_FILE}-shm"
    HAS_ACTIVE_PROCESS=0

    if [ -f "$WAL_FILE" ];then
        WAL_SIZE=$(du -h "$WAL_FILE" | awk '{print $1}')
        echo -e "${YELLOW}存在WAL日志文件，大小：$WAL_SIZE${NC}"
        echo "WAL文件:$WAL_FILE 大小:$WAL_SIZE" >> "$LOG_FILE"
        HAS_ACTIVE_PROCESS=1
    fi
    if [ -f "$SHM_FILE" ];then
        SHM_SIZE=$(du -h "$SHM_FILE" | awk '{print $1}')
        echo -e "${YELLOW}存在共享内存shm文件，大小：$SHM_SIZE${NC}"
        echo "SHM文件:$SHM_FILE 大小:$SHM_SIZE" >> "$LOG_FILE"
        HAS_ACTIVE_PROCESS=1
    fi

    if [ $HAS_ACTIVE_PROCESS -eq 1 ];then
        echo -e "${YELLOW}提示：当前有程序正在读写该数据库${NC}"
        echo "状态：数据库存在活跃读写进程" >> "$LOG_FILE"
    fi

    echo -e "${GREEN}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<${NC}"
    echo ""
done

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}全部数据库巡检完成！完整报告：$LOG_FILE${NC}"
echo -e "${BLUE}====================================================${NC}"