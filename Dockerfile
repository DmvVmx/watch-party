# Используем официальный Node.js образ
FROM node:18-alpine

# Рабочая директория
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Устанавливаем зависимости
RUN npm ci
RUN cd client && npm ci
RUN cd server && npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем клиент
RUN cd client && npm run build

# Открываем порт
EXPOSE 3000

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Запускаем приложение
CMD ["npm", "start"]