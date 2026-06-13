#!/bin/bash

# Скрипт развертывания Watch Party на сервере
set -e

echo "🚀 Начинаем развертывание Watch Party..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не найден. Устанавливаем...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js версия: $NODE_VERSION${NC}"

# Проверяем наличие PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 не найден. Устанавливаем...${NC}"
    sudo npm install -g pm2
fi

# Устанавливаем зависимости
echo -e "${YELLOW}Устанавливаем зависимости...${NC}"
npm run install-all

# Собираем проект
echo -e "${YELLOW}Собираем проект...${NC}"
npm run build

# Создаем папку для логов
mkdir -p logs

# Останавливаем существующий процесс если есть
pm2 stop watch-party 2>/dev/null || true
pm2 delete watch-party 2>/dev/null || true

# Запускаем новый процесс
echo -e "${YELLOW}Запускаем приложение...${NC}"
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2
pm2 save

# Настраиваем автозапуск
pm2 startup

echo -e "${GREEN}✅ Развертывание завершено!${NC}"
echo -e "${GREEN}Приложение доступно на порту 3000${NC}"
echo -e "${YELLOW}Используйте 'pm2 status' для проверки статуса${NC}"
echo -e "${YELLOW}Используйте 'pm2 logs watch-party' для просмотра логов${NC}"