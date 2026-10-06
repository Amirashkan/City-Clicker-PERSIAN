@echo off
setlocal

cd /d E:\City-Clicker-PERSIAN

echo.
echo ==============================
echo  1. Web Build
echo ==============================
call npm run build
if errorlevel 1 goto error

echo.
echo ==============================
echo  2. Capacitor Sync
echo ==============================
call npx cap sync android
if errorlevel 1 goto error

cd /d E:\City-Clicker-PERSIAN\android

set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo ==============================
echo  3. Gradle Build
echo ==============================
call .\gradlew.bat --init-script ..\gradle-mirror.init.gradle assembleDebug
if errorlevel 1 goto error

echo.
echo ==============================
echo  4. Install APK
echo ==============================
"C:\Users\ASUS\AppData\Local\Android\Sdk\platform-tools\adb.exe" -s R5CY11ANP3Z install -r E:\City-Clicker-PERSIAN\android\app\build\outputs\apk\debug\app-debug.apk
if errorlevel 1 goto error

echo.
echo ==============================
echo  DONE
echo ==============================
pause
exit /b 0

:error
echo.
echo ==============================
echo  FAILED
echo ==============================
pause
exit /b 1