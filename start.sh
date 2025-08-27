#!/bin/bash

# 当脚本退出时，定义一个清理函数来停止后台进程
cleanup() {
    echo "正在关闭服务..."
    # 检查签名服务的PID是否存在并且进程正在运行
    if [ -n "$SIGN_PID" ] && kill -0 $SIGN_PID 2>/dev/null; then
        echo "正在停止签名服务 (PID: $SIGN_PID)..."
        kill $SIGN_PID
    fi
    exit 0
}

# 捕获 Ctrl+C (SIGINT) 和终止信号 (SIGTERM) 来执行清理函数
trap cleanup SIGINT SIGTERM

# 无限循环来保持服务运行
while true; do
    # 1. 在后台启动 Python 签名服务
    echo "正在启动签名服务..."
    python3 ../Lighter_Sign/main.py &
    SIGN_PID=$!
    echo "签名服务已启动, PID: $SIGN_PID"

    # 2. 等待15秒，确保签名服务完全启动
    echo "等待15秒..."
    sleep 15

    # 3. 在前台启动交易程序
    #    脚本会在这里暂停，直到 `bun` 命令退出
    echo "正在启动交易程序..."
    bun run src/index.ts

    # 4. 如果交易程序退出，脚本会从这里继续执行
    echo "交易程序已停止。正在重启所有服务..."

    # 在重启循环之前，停止签名服务
    echo "正在停止签名服务 (PID: $SIGN_PID)..."
    kill $SIGN_PID
    # 等待进程确实被杀死
    wait $SIGN_PID 2>/dev/null

    # (可选) 在重启前短暂延迟
    echo "5秒后将重启服务..."
    sleep 5
done
