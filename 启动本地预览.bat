@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ComfyUI Web 本地预览
echo  ====================
echo.
if exist node_modules\.bin\node.exe (
    node scripts\sync-deploy.js
) else (
    where node >nul 2>&1 && node scripts\sync-deploy.js
)
echo.
echo  正在启动本地服务器...
echo  门户: http://127.0.0.1:8080/
echo  生图: http://127.0.0.1:8080/app/
echo  发帖: http://127.0.0.1:8080/admin/
echo.
python server.py 8080
pause
