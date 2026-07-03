@echo off
chcp 65001 >nul
title 迁移 Cursor 数据到 D 盘

echo ============================================
echo   Cursor 数据迁移工具
echo   将 C 盘 Cursor 数据搬运到 D:\CursorData
echo ============================================
echo.

:: 检查 Cursor 是否在运行
tasklist /FI "IMAGENAME eq Cursor.exe" 2>NUL | find /I "Cursor.exe" >NUL
if %ERRORLEVEL% EQU 0 (
    echo [!] 检测到 Cursor 正在运行，请先完全关闭 Cursor！
    echo     右下角托盘图标也要退出。
    echo.
    pause
    exit /b 1
)

echo [OK] Cursor 未在运行，开始迁移...
echo.

set "SRC=%APPDATA%\Cursor"
set "DST=D:\CursorData"

:: 检查源目录是否存在
if not exist "%SRC%" (
    echo [!] 源目录不存在: %SRC%
    echo     可能已经迁移过了。
    pause
    exit /b 1
)

:: 检查是否已经是符号链接
fsutil reparsepoint query "%SRC%" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [!] %SRC% 已经是一个链接，无需再次迁移。
    pause
    exit /b 0
)

:: 检查目标目录是否已存在
if exist "%DST%" (
    echo [!] 目标目录已存在: %DST%
    echo     请先手动删除或重命名后再运行。
    pause
    exit /b 1
)

echo [1/3] 正在移动文件到 D 盘...（约 28 GB，可能需要几分钟）
echo       从: %SRC%
echo       到: %DST%
echo.

robocopy "%SRC%" "%DST%" /E /MOVE /R:3 /W:5 /NP /NFL /NDL /NJH /NJS
if %ERRORLEVEL% GEQ 8 (
    echo [!] 移动文件时出错，请检查磁盘空间。
    pause
    exit /b 1
)

echo.
echo [2/3] 正在清理残留目录...
if exist "%SRC%" rmdir /S /Q "%SRC%" 2>nul

echo [3/3] 正在创建符号链接（需要管理员权限）...
mklink /D "%SRC%" "%DST%"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] 创建符号链接失败！可能需要管理员权限。
    echo     请右键此脚本 - 以管理员身份运行
    echo.
    echo     如果移动已完成但链接未创建，Cursor 将无法启动。
    echo     临时修复: 手动把 D:\CursorData 移回原位
    pause
    exit /b 1
)

echo.
echo ============================================
echo   迁移完成！
echo   数据已移至: %DST%
echo   符号链接: %SRC% - %DST%
echo   现在可以正常启动 Cursor 了。
echo ============================================
echo.
pause
