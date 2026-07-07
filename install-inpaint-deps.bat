@echo off
cd /d "%~dp0"
title ComfyUI Web Inpaint Setup
set "FINAL_HINT=Done. Please restart ComfyUI before using inpaint."

if not exist "%~dp0install-inpaint-deps.ps1" (
    echo.
    echo [ERROR] Missing install-inpaint-deps.ps1
    echo         Copy BOTH .bat and .ps1 to the same ComfyUI folder.
    echo.
    goto HOLD_WINDOW
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
        goto HOLD_WINDOW
    )
)
echo.
echo Report: %CD%\inpaint-deps-report.txt
echo.
echo %FINAL_HINT%
echo.
pause

:HOLD_WINDOW
echo.
echo ==================================================
echo  %FINAL_HINT%
echo  This window will stay open. Close it manually.
echo ==================================================
echo.
cmd /k
