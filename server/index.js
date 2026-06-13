const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const { 
  validateMessage, 
  sanitizeString 
} = require('./middleware/security')

// Загружаем переменные окружения в режиме разработки
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config()
  } catch (e) {
    console.log('dotenv не установлен, используем системные переменные')
  }
}

// Настройки из переменных окружения
const config = {
  port: process.env.PORT || 5000,
  maxParticipants: parseInt(process.env.MAX_PARTICIPANTS) || 10,
  roomMaxAge: (parseInt(process.env.ROOM_MAX_AGE_HOURS) || 24) * 60 * 60 * 1000,
  maxChatMessages: parseInt(process.env.MAX_CHAT_MESSAGES) || 100,
  cleanupInterval: (parseInt(process.env.CLEANUP_INTERVAL_MINUTES) || 10) * 60 * 1000,
  corsOrigin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"]
}

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"]
  }
})

// Создаем папку для загруженных видео
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname)
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB максимум
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Неподдерживаемый формат видео'))
    }
  }
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Статический доступ к загруженным видео
app.use('/uploads', express.static(uploadsDir))

// API для загрузки видео
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' })
    }

    const videoUrl = `/uploads/${req.file.filename}`
    
    res.json({
      success: true,
      url: videoUrl,
      filename: req.file.originalname,
      size: req.file.size
    })
  } catch (error) {
    console.error('Ошибка загрузки видео:', error)
    res.status(500).json({ error: 'Ошибка загрузки видео' })
  }
})

// Статические файлы в продакшене
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
}

// Хранилище данных в памяти
const rooms = new Map()
const users = new Map()

// Утилиты
const createRoom = (hostId, hostName) => {
  const roomId = uuidv4().slice(0, 8)
  const room = {
    id: roomId,
    name: `Комната ${roomId}`,
    hostId,
    participants: [{
      id: hostId,
      name: hostName,
      isHost: true,
      connected: true,
      joinedAt: Date.now()
    }],
    currentVideo: null,
    videoState: {
      currentTime: 0,
      playing: false,
      duration: 0
    },
    messages: [],
    createdAt: Date.now()
  }
  rooms.set(roomId, room)
  return room
}

const addUserToRoom = (roomId, userId, userName) => {
  const room = rooms.get(roomId)
  if (!room) return null

  // Проверяем, не превышен ли лимит участников
  if (room.participants.length >= config.maxParticipants) {
    return { error: 'Комната переполнена' }
  }

  // Проверяем, не присоединился ли пользователь уже
  const existingUser = room.participants.find(p => p.id === userId)
  if (existingUser) {
    existingUser.connected = true
    return room
  }

  // Добавляем нового участника
  const participant = {
    id: userId,
    name: userName,
    isHost: false,
    connected: true,
    joinedAt: Date.now()
  }
  
  room.participants.push(participant)
  return room
}

const removeUserFromRoom = (roomId, userId) => {
  const room = rooms.get(roomId)
  if (!room) return

  room.participants = room.participants.filter(p => p.id !== userId)
  
  // Если комната пуста, удаляем её
  if (room.participants.length === 0) {
    rooms.delete(roomId)
    return null
  }

  // Если хост вышел, назначаем нового хоста
  if (room.hostId === userId && room.participants.length > 0) {
    const newHost = room.participants[0]
    newHost.isHost = true
    room.hostId = newHost.id
  }

  return room
}

const addMessage = (roomId, userId, userName, text) => {
  const room = rooms.get(roomId)
  if (!room) return null

  const message = {
    id: uuidv4(),
    userId,
    userName,
    text,
    timestamp: Date.now()
  }

  room.messages.push(message)
  
  // Ограничиваем историю сообщений
  if (room.messages.length > config.maxChatMessages) {
    room.messages = room.messages.slice(-config.maxChatMessages)
  }

  return message
}

// Socket.IO обработчики
io.on('connection', (socket) => {
  console.log(`Пользователь подключился: ${socket.id}`)
  
  // Сохраняем информацию о пользователе
  users.set(socket.id, {
    id: socket.id,
    roomId: null,
    name: null
  })

  // Создание комнаты
  socket.on('create-room', (data, callback) => {
    try {
      const { userName } = data
      const userId = socket.id
      
      const room = createRoom(userId, userName)
      
      users.get(userId).roomId = room.id
      users.get(userId).name = userName
      
      socket.join(room.id)
      
      console.log(`Создана комната ${room.id} пользователем ${userName}`)
      
      callback({
        success: true,
        roomId: room.id,
        room,
        user: room.participants[0]
      })
    } catch (error) {
      console.error('Ошибка создания комнаты:', error)
      callback({
        success: false,
        error: 'Не удалось создать комнату'
      })
    }
  })

  // Присоединение к комнате
  socket.on('join-room', (data, callback) => {
    try {
      const { roomId, userName } = data
      const userId = socket.id

      if (!rooms.has(roomId)) {
        return callback({
          success: false,
          error: 'Комната не найдена'
        })
      }

      const result = addUserToRoom(roomId, userId, userName)
      
      if (result.error) {
        return callback({
          success: false,
          error: result.error
        })
      }

      const room = result
      const user = room.participants.find(p => p.id === userId)
      
      users.get(userId).roomId = roomId
      users.get(userId).name = userName
      
      socket.join(roomId)
      
      // Отправляем обновление всем в комнате
      socket.to(roomId).emit('participants-updated', room.participants)
      socket.to(roomId).emit('room-updated', room)
      
      console.log(`${userName} присоединился к комнате ${roomId}`)
      
      callback({
        success: true,
        room,
        user,
        messages: room.messages
      })

      // Если есть активное видео, отправляем синхронизацию новому участнику
      if (room.currentVideo && room.videoState) {
        socket.emit('video-sync', room.videoState)
      }
    } catch (error) {
      console.error('Ошибка присоединения к комнате:', error)
      callback({
        success: false,
        error: 'Не удалось присоединиться к комнате'
      })
    }
  })

  // Изменение состояния видео
  socket.on('video-state-change', (data) => {
    try {
      const { roomId, currentTime, playing, duration } = data
      const room = rooms.get(roomId)
      const user = users.get(socket.id)
      
      if (!room || !user || room.hostId !== socket.id) {
        return
      }

      room.videoState = {
        currentTime: currentTime || 0,
        playing: Boolean(playing),
        duration: duration || 0,
        lastUpdate: Date.now()
      }

      console.log(`Хост ${user.name} синхронизирует видео:`, room.videoState)

      // Отправляем синхронизацию всем остальным участникам
      socket.to(roomId).emit('video-sync', room.videoState)
      
    } catch (error) {
      console.error('Ошибка синхронизации видео:', error)
    }
  })

  // Смена видео
  socket.on('change-video', (data) => {
    try {
      const { roomId, video } = data
      const room = rooms.get(roomId)
      const user = users.get(socket.id)
      
      if (!room || !user || room.hostId !== socket.id) {
        return
      }

      room.currentVideo = video
      room.videoState = {
        currentTime: 0,
        playing: false,
        duration: 0
      }

      // Уведомляем всех об изменении видео
      io.to(roomId).emit('video-changed', video)
      io.to(roomId).emit('room-updated', room)
      
      console.log(`Хост ${user.name} сменил видео в комнате ${roomId}`)
      
    } catch (error) {
      console.error('Ошибка смены видео:', error)
    }
  })

  // Отправка сообщения
  socket.on('send-message', (data) => {
    try {
      const { roomId, message } = data
      const user = users.get(socket.id)
      
      if (!user || !user.roomId || user.roomId !== roomId) {
        return
      }

      // Валидация сообщения
      if (!validateMessage(data)) {
        socket.emit('message-error', { error: 'Неверный формат сообщения' })
        return
      }

      // Санитизация текста сообщения
      const sanitizedMessage = sanitizeString(message)
      
      const messageObj = addMessage(roomId, socket.id, user.name, sanitizedMessage)
      if (messageObj) {
        io.to(roomId).emit('new-message', messageObj)
      }
      
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    }
  })

  // Запрос синхронизации
  socket.on('request-sync', (data) => {
    try {
      const { roomId } = data
      const room = rooms.get(roomId)
      
      if (room && room.videoState) {
        socket.emit('video-sync', room.videoState)
      }
    } catch (error) {
      console.error('Ошибка запроса синхронизации:', error)
    }
  })

  // Отключение пользователя
  socket.on('disconnect', () => {
    try {
      const user = users.get(socket.id)
      if (user && user.roomId) {
        const room = removeUserFromRoom(user.roomId, socket.id)
        
        if (room) {
          // Уведомляем остальных участников
          socket.to(user.roomId).emit('participants-updated', room.participants)
          socket.to(user.roomId).emit('room-updated', room)
          console.log(`${user.name} покинул комнату ${user.roomId}`)
        } else {
          console.log(`Комната ${user.roomId} была удалена`)
        }
      }
      
      users.delete(socket.id)
      console.log(`Пользователь отключился: ${socket.id}`)
      
    } catch (error) {
      console.error('Ошибка при отключении:', error)
    }
  })
})

// Маршрут для продакшена
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

// Очистка неактивных комнат
setInterval(() => {
  const now = Date.now()
  
  for (const [roomId, room] of rooms.entries()) {
    if (now - room.createdAt > config.roomMaxAge || room.participants.length === 0) {
      rooms.delete(roomId)
      console.log(`Удалена неактивная комната: ${roomId}`)
    }
  }
}, config.cleanupInterval)

const PORT = config.port

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
  console.log(`📊 Режим: ${process.env.NODE_ENV || 'development'}`)
  console.log(`👥 Максимум участников: ${config.maxParticipants}`)
  console.log(`⏰ Время жизни комнат: ${config.roomMaxAge / (60 * 60 * 1000)} часов`)
})