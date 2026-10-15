@echo off
cd /d %~dp0
start http://localhost:8000
where python >nul 2>nul
if %errorlevel%==0 (
    python -m http.server 8000
) else (
    echo 未检测到 Python，尝试使用 npx serve 启动...
    npx serve -l 8000
)
