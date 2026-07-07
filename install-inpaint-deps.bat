@echo off
cd /d "%~dp0"
title ComfyUI Web Inpaint Setup

if not exist "%~dp0install-inpaint-deps.ps1" (
    echo.
    echo [ERROR] Missing install-inpaint-deps.ps1
    echo         Copy BOTH .bat and .ps1 to the same ComfyUI folder.
    echo.
    pause
    exit /b 1
)

echo.
echo ComfyUI Web - Inpaint dependencies check and install
echo NO pip - git clone and model download only
echo Script location: %CD%
echo.
set "PS_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if exist "%PS_EXE%" (
    "%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-inpaint-deps.ps1"
) else (
    where pwsh >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-inpaint-deps.ps1"
    ) else (
        echo [ERROR] PowerShell not found on this system.
        echo         Please enable Windows PowerShell and run again.
        echo.
        pause
        exit /b 1
    )
)
echo.
echo Report: %CD%\inpaint-deps-report.txt
echo.
pause
