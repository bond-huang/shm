@echo off
echo ========================================
echo  Bridge Route Fix Tool
echo  Run as Administrator!
echo ========================================
echo.

:: 保存当前网关
echo [1] Saving current gateway...
for /f "tokens=3" %%a in ('route print ^| findstr "0.0.0.0" ^| findstr "0.0.0.0"') do set GW=%%a
echo    Gateway: %GW%

:: 等待网桥启动
echo.
echo [2] Waiting for bridge to start (5 seconds)...
timeout /t 5 /nobreak >nul

:: 恢复默认路由
echo [3] Restoring default route...
route delete 0.0.0.0 mask 0.0.0.0 2>nul
route add 0.0.0.0 mask 0.0.0.0 %GW% metric 10
echo    Default gateway restored to: %GW%

:: 添加AIX网段路由
echo [4] Adding route for AIX (192.168.34.0/24)...
route add 192.168.34.0 mask 255.255.255.0 %GW% metric 5
echo    Route added: 192.168.34.0/24 via %GW%

:: 刷新DNS
echo [5] Flushing DNS cache...
ipconfig /flushdns >nul

echo.
echo ========================================
echo  Done! You can now:
echo  - Access AIX (192.168.34.x)
echo  - Browse internet normally
echo ========================================
echo.
pause
