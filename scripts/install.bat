@echo off
REM Скрипт установки для Windows

echo 🚀 Устанавливаем Watch Party...

REM Проверяем Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден. Установите Node.js 18+ с https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js найден
node --version

REM Устанавливаем зависимости
echo 📦 Устанавливаем зависимости...
call npm run install-all

if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)

echo ✅ Зависимости установлены

REM Собираем проект
echo 🔨 Собираем проект...
call npm run build

if errorlevel 1 (
    echo ❌ Ошибка сборки проекта
    pause
    exit /b 1
)

echo ✅ Проект собран
echo.
echo 🎉 Установка завершена!
echo.
echo Для запуска в режиме разработки: npm run dev
echo Для запуска в продакшене: npm start
echo.
pause