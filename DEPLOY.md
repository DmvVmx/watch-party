# 🚀 Быстрое развертывание Watch Party

## Вариант 1: Простая установка (рекомендуется)

### На Linux/Mac сервере:

1. **Клонируйте репозиторий**:
```bash
git clone <your-repo-url>
cd watch-party-app
```

2. **Запустите скрипт установки**:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Скрипт автоматически:
- Установит Node.js если нужно
- Установит PM2
- Установит зависимости
- Соберет проект
- Запустит приложение

### На Windows:

1. **Клонируйте репозиторий**
2. **Запустите**: `scripts/install.bat`
3. **Для разработки**: `scripts/start.bat`

## Вариант 2: Docker (для продакшена)

```bash
# Клонируйте репозиторий
git clone <your-repo-url>
cd watch-party-app

# Запустите через Docker Compose
docker-compose up -d
```

## Вариант 3: Ручная установка

### Требования
- Node.js 18+
- NPM 8+

### Шаги установки

1. **Установка зависимостей**:
```bash
npm run install-all
```

2. **Сборка проекта**:
```bash
npm run build
```

3. **Запуск в разработке**:
```bash
npm run dev
```

4. **Запуск в продакшене**:
```bash
npm start
```

## 🌐 Настройка домена и SSL

### Nginx + Let's Encrypt

1. **Установите Nginx**:
```bash
sudo apt update
sudo apt install nginx
```

2. **Скопируйте конфигурацию**:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/watch-party
sudo ln -s /etc/nginx/sites-available/watch-party /etc/nginx/sites-enabled/
```

3. **Отредактируйте домен в nginx.conf**:
```bash
sudo nano /etc/nginx/sites-available/watch-party
# Замените your-domain.com на ваш домен
```

4. **Получите SSL сертификат**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

5. **Перезапустите Nginx**:
```bash
sudo systemctl reload nginx
```

## ⚙️ Переменные окружения

Создайте файл `.env` (скопируйте `.env.example`):

```bash
cp .env.example .env
```

Настройте переменные:

```env
NODE_ENV=production
PORT=3000
DOMAIN=your-domain.com
MAX_PARTICIPANTS=10
ROOM_MAX_AGE_HOURS=24
MAX_CHAT_MESSAGES=100
CLEANUP_INTERVAL_MINUTES=10
```

## 📊 Мониторинг и управление

### PM2 команды:

```bash
# Статус приложения
pm2 status

# Просмотр логов
pm2 logs watch-party

# Перезапуск
pm2 restart watch-party

# Остановка
pm2 stop watch-party

# Удаление процесса
pm2 delete watch-party
```

### Обновление приложения:

```bash
./scripts/update.sh
```

## 🔥 Firewall настройки

```bash
# Разрешить HTTP и HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Если используете другой порт
sudo ufw allow 3000
```

## 📈 Проверка работоспособности

После развертывания:

1. **Откройте браузер**: `http://your-domain.com` или `http://server-ip:3000`
2. **Создайте комнату**
3. **Скопируйте ссылку и откройте в новой вкладке**
4. **Проверьте синхронизацию видео и чат**

## 🛠 Устранение проблем

### Приложение не запускается:
```bash
# Проверьте логи
pm2 logs watch-party

# Проверьте порт
sudo netstat -tlnp | grep 3000

# Проверьте права доступа
sudo chown -R $USER:$USER ./
```

### Проблемы с видео:
- Убедитесь что видео доступно по прямой ссылке
- Проверьте CORS настройки
- Используйте HTTPS для загрузки файлов

### Socket.IO не работает:
- Проверьте настройки Nginx для WebSocket
- Убедитесь что порт открыт в firewall

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи: `pm2 logs watch-party`
2. Проверьте статус: `pm2 status`
3. Перезапустите: `pm2 restart watch-party`

---

**Готово! Теперь вы можете смотреть фильмы вместе! 🍿**