@echo off
echo ===========================================
echo   📚 مشروع التاريخ الإسلامي
echo ===========================================
echo.
echo 1) تشغيل التطبيق (Expo React Native)
echo 2) تشغيل لوحة التحكم (Admin Panel)
echo 3) تشغيل الاثنين معاً
echo 4) خروج
echo.

set /p choice="اختر رقم: "

if "%choice%"=="1" (
    echo.
    echo 🔵 تشغيل التطبيق على http://localhost:8081
    cd /d "%~dp0"
    npm run web
) else if "%choice%"=="2" (
    echo.
    echo 🟢 تشغيل لوحة التحكم على http://localhost:4000
    cd /d "%~dp0\admin"
    npm start
) else if "%choice%"=="3" (
    echo.
    echo 🔵 تشغيل التطبيق + 🟢 لوحة التحكم
    echo.
    start "Admin Panel" cmd /c "cd /d "%~dp0\admin" && npm start"
    echo تم تشغيل لوحة التحكم على http://localhost:4000
    echo.
    cd /d "%~dp0"
    npm run web
) else (
    echo مع السلامة
    exit /b
)