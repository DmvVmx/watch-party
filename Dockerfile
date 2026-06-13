# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Устанавливаем зависимости
RUN npm ci --only=production
RUN cd client && npm ci --only=production
RUN cd ../server && npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем клиентскую часть
RUN cd client && npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Меняем владельца файлов
USER nextjs

# Открываем порт
EXPOSE 3000

# Устанавливаем переменные окружения
ENV NODE_ENV production
ENV PORT 3000

# Запускаем приложение
CMD ["npm", "start"]