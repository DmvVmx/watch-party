# 📁 Структура проекта Watch Party

```
watch-party-app/
├── 📄 README.md                    # Основная документация
├── 📄 DEPLOY.md                    # Инструкции по развертыванию
├── 📄 PROJECT_STRUCTURE.md         # Этот файл
├── 📄 package.json                 # Корневой package.json
├── 📄 .gitignore                   # Git исключения
├── 📄 .dockerignore                # Docker исключения
├── 📄 .env.example                 # Пример переменных окружения
├── 📄 Dockerfile                   # Docker образ
├── 📄 docker-compose.yml           # Docker Compose конфигурация
├── 📄 nginx.conf                   # Nginx конфигурация
├── 📄 ecosystem.config.js          # PM2 конфигурация
│
├── 📁 client/                      # Frontend (React + Vite)
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   ├── 📄 index.html
│   └── 📁 src/
│       ├── 📄 main.jsx             # Точка входа React
│       ├── 📄 App.jsx              # Главный компонент
│       ├── 📄 index.css            # Глобальные стили
│       ├── 📁 pages/
│       │   ├── 📄 Home.jsx         # Главная страница
│       │   └── 📄 Room.jsx         # Страница комнаты
│       ├── 📁 components/
│       │   ├── 📄 VideoPlayer.jsx  # Видеоплеер
│       │   ├── 📄 Chat.jsx         # Чат
│       │   ├── 📄 ParticipantsList.jsx  # Список участников
│       │   ├── 📄 VideoUpload.jsx  # Загрузка видео
│       │   └── 📄 RoomHeader.jsx   # Заголовок комнаты
│       └── 📁 context/
│           └── 📄 SocketContext.jsx # Socket.IO контекст
│
├── 📁 server/                      # Backend (Node.js + Express)
│   ├── 📄 package.json
│   ├── 📄 index.js                 # Главный файл сервера
│   └── 📁 middleware/
│       └── 📄 security.js          # Middleware безопасности
│
└── 📁 scripts/                     # Скрипты развертывания
    ├── 📄 deploy.sh               # Linux/Mac развертывание
    ├── 📄 update.sh               # Обновление приложения
    ├── 📄 install.bat             # Windows установка
    └── 📄 start.bat               # Windows запуск
```

## 🎯 Ключевые компоненты

### Frontend (React)

**Страницы:**
- `Home.jsx` - Главная страница с созданием/присоединением к комнате
- `Room.jsx` - Основная страница просмотра с видеоплеером

**Компоненты:**
- `VideoPlayer.jsx` - Кастомный HTML5 видеоплеер с синхронизацией
- `Chat.jsx` - Чат в реальном времени
- `ParticipantsList.jsx` - Список участников комнаты
- `VideoUpload.jsx` - Загрузка видео (файл/ссылка)
- `RoomHeader.jsx` - Заголовок с информацией о комнате

**Контексты:**
- `SocketContext.jsx` - Управление Socket.IO соединением

### Backend (Node.js)

**Основные файлы:**
- `index.js` - Express сервер + Socket.IO обработчики
- `middleware/security.js` - Безопасность и валидация

**Функциональность:**
- Управление комнатами в памяти
- Синхронизация видео между участниками
- Чат в реальном времени
- Валидация и санитизация данных

### Конфигурация

**Развертывание:**
- `Dockerfile` - Контейнеризация приложения
- `docker-compose.yml` - Оркестрация с Nginx
- `nginx.conf` - Прокси и SSL настройки
- `ecosystem.config.js` - PM2 конфигурация

**Скрипты:**
- Linux/Mac автоматизация развертывания
- Windows batch файлы для установки

## 🔧 Технологический стек

### Frontend
- ⚛️ **React 18** - UI библиотека
- ⚡ **Vite** - Сборщик и dev сервер
- 🎨 **Tailwind CSS** - Utility-first стили
- 🔌 **Socket.IO Client** - WebSocket клиент
- 🎯 **React Router** - Роутинг
- 🎪 **Lucide React** - Иконки

### Backend
- 🟢 **Node.js** - Runtime
- 🚀 **Express** - Web фреймворк
- 🔌 **Socket.IO** - WebSocket сервер
- 🛡️ **Helmet** - Безопасность заголовков
- ⏱️ **Express Rate Limit** - Лимиты запросов
- 🆔 **UUID** - Генерация ID

### DevOps & Deployment
- 🐳 **Docker** - Контейнеризация
- 🌐 **Nginx** - Reverse proxy
- ⚙️ **PM2** - Process manager
- 🔒 **Let's Encrypt** - SSL сертификаты

## 📊 Архитектура данных

### Структура комнаты
```javascript
{
  id: "uuid",
  name: "Комната название", 
  hostId: "socket_id",
  participants: [
    {
      id: "socket_id",
      name: "Имя пользователя",
      isHost: true/false,
      connected: true/false,
      joinedAt: timestamp
    }
  ],
  currentVideo: {
    url: "video_url",
    title: "Название видео",
    type: "url|file"
  },
  videoState: {
    currentTime: 0,
    playing: false,
    duration: 0,
    lastUpdate: timestamp
  },
  messages: [
    {
      id: "uuid",
      userId: "socket_id", 
      userName: "Имя",
      text: "Текст сообщения",
      timestamp: timestamp
    }
  ],
  createdAt: timestamp
}
```

## 🚀 Socket.IO Events

### Клиент → Сервер
- `create-room` - Создание новой комнаты
- `join-room` - Присоединение к существующей комнате
- `video-state-change` - Изменение состояния видео (хост)
- `change-video` - Смена видео (хост)
- `send-message` - Отправка сообщения в чат

### Сервер → Клиент  
- `room-updated` - Обновление данных комнаты
- `video-sync` - Синхронизация состояния видео
- `video-changed` - Уведомление о смене видео
- `new-message` - Новое сообщение в чате
- `participants-updated` - Обновление списка участников

## 🛡️ Безопасность

- **Rate limiting** на создание комнат и сообщения
- **Валидация** всех входящих данных
- **Санитизация** пользовательского ввода
- **CORS** настройки для продакшена
- **Helmet** для заголовков безопасности
- **CSP** политики для предотвращения XSS

## 📱 Поддержка устройств

- 💻 **Desktop** - полная функциональность
- 📱 **Mobile** - адаптивная верстка
- 🌐 **Cross-browser** - современные браузеры
- ♿ **Accessibility** - базовая поддержка

---

**Готово к использованию! 🎉**