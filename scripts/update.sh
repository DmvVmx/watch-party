#!/bin/bash

# Скрипт обновления Watch Party
set -e

echo "🔄 Обновляем Watch Party..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Получаем последние изменения
echo -e "${YELLOW}Загружаем обновления...${NC}"
git pull origin main

# Устанавливаем/обновляем зависимости
echo -e "${YELLOW}Обновляем зависимости...${NC}"
npm run install-all

# Собираем проект заново
echo -e "${YELLOW}Пересобираем проект...${NC}"
npm run build

# Перезапускаем приложение
echo -e "${YELLOW}Перезапускаем приложение...${NC}"
pm2 restart watch-party

echo -e "${GREEN}✅ Обновление завершено!${NC}"
pm2 status