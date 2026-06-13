import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import VideoPlayer from '../components/VideoPlayer'
import Chat from '../components/Chat'
import ParticipantsList from '../components/ParticipantsList'
import VideoUpload from '../components/VideoUpload'
import RoomHeader from '../components/RoomHeader'

const Room = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  
  const [room, setRoom] = useState(null)
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [videoState, setVideoState] = useState({
    currentTime: 0,
    playing: false,
    duration: 0
  })

  const videoRef = useRef(null)
  const lastSyncTime = useRef(0)

  useEffect(() => {
    if (!socket) return

    // Получаем имя пользователя из localStorage или создаем дефолтное
    const savedUserName = localStorage.getItem('watchparty-username') || `User-${Math.floor(Math.random() * 1000)}`

    // Присоединиться к комнате при загрузке
    socket.emit('join-room', { roomId, userName: savedUserName }, (response) => {
      if (!response.success) {
        alert('Не удалось присоединиться к комнате')
        navigate('/')
        return
      }
      setUser(response.user)
      setRoom(response.room)
      setMessages(response.messages || [])
      
      // ВАЖНО: устанавливаем текущее видео и состояние для участников
      if (response.room.currentVideo) {
        setCurrentVideo(response.room.currentVideo)
        if (response.room.videoState) {
          setVideoState(response.room.videoState)
        }
      }
    })

    // Обновление комнаты
    socket.on('room-updated', (roomData) => {
      setRoom(roomData)
    })

    // Синхронизация видео
    socket.on('video-sync', (data) => {
      console.log('Получена синхронизация:', data)
      const now = Date.now()
      if (now - lastSyncTime.current > 500) { // Избегаем частой синхронизации
        setVideoState(data)
        
        // Синхронизируем видео с небольшой задержкой для загрузки
        setTimeout(() => {
          if (videoRef.current && !user?.isHost) {
            console.log('Синхронизируем участника:', data)
            const video = videoRef.current
            
            // Синхронизация времени
            const timeDiff = Math.abs(video.currentTime - data.currentTime)
            if (timeDiff > 1) {
              console.log(`Корректируем время с ${video.currentTime} на ${data.currentTime}`)
              video.currentTime = data.currentTime
            }
            
            // Синхронизация воспроизведения
            const isPlaying = !video.paused
            if (data.playing !== isPlaying) {
              console.log(`Меняем состояние с ${isPlaying} на ${data.playing}`)
              if (data.playing) {
                video.play().catch(err => console.log('Ошибка play:', err))
              } else {
                video.pause()
              }
            }
          }
        }, 100)
        
        lastSyncTime.current = now
      }
    })

    // Смена видео
    socket.on('video-changed', (videoData) => {
      console.log('Получено новое видео:', videoData)
      setCurrentVideo(videoData)
      setVideoState({ currentTime: 0, playing: false, duration: 0 })
      
      // Для участников: ждем загрузки метаданных и синхронизируемся с хостом
      if (!user?.isHost && videoRef.current) {
        const handleLoadedMetadata = () => {
          console.log('Видео загружено у участника, запрашиваем синхронизацию')
          // Запрашиваем актуальное состояние у сервера
          socket.emit('request-sync', { roomId })
        }
        
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
      }
    })

    // Новое сообщение
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Обновление участников
    socket.on('participants-updated', (participants) => {
      setRoom(prev => prev ? { ...prev, participants } : null)
    })

    return () => {
      socket.off('room-updated')
      socket.off('video-sync')
      socket.off('video-changed')
      socket.off('new-message')
      socket.off('participants-updated')
    }
  }, [socket, roomId, navigate])

  const handleVideoStateChange = (newState) => {
    if (!user?.isHost) return
    
    console.log('Хост отправляет синхронизацию:', newState)
    socket.emit('video-state-change', {
      roomId,
      ...newState
    })
  }

  // Принудительная синхронизация каждые 5 секунд для хоста
  useEffect(() => {
    if (!user?.isHost || !videoRef.current) return

    const interval = setInterval(() => {
      const video = videoRef.current
      if (video && currentVideo) {
        const syncData = {
          currentTime: video.currentTime,
          playing: !video.paused,
          duration: video.duration
        }
        console.log('Принудительная синхронизация хоста:', syncData)
        socket.emit('video-state-change', {
          roomId,
          ...syncData
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user?.isHost, socket, roomId, currentVideo])

  const handleVideoSelect = (videoData) => {
    if (!user?.isHost) return
    
    socket.emit('change-video', {
      roomId,
      video: videoData
    })
  }

  const handleSendMessage = (message) => {
    socket.emit('send-message', {
      roomId,
      message
    })
  }

  if (!room || !user) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 border-2 border-[#30363d] border-t-[#2f81f7] rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-[#f0f6fc] mb-2">Подключение к комнате</h2>
            <p className="text-[#7d8590]">Загрузка данных комнаты...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-4">
      <div className="max-w-7xl mx-auto">
        <RoomHeader room={room} user={user} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Список участников */}
          <div className="lg:col-span-1 order-3 lg:order-1">
            <ParticipantsList participants={room.participants} />
          </div>
          
          {/* Видеоплеер */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {currentVideo ? (
              <VideoPlayer
                ref={videoRef}
                video={currentVideo}
                videoState={videoState}
                isHost={user.isHost}
                onStateChange={handleVideoStateChange}
              />
            ) : (
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 aspect-video flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                  <h3 className="text-xl text-[#f0f6fc] mb-2">Видео не выбрано</h3>
                  <p className="text-[#7d8590]">
                    {user.isHost 
                      ? 'Выберите видео для начала просмотра'
                      : 'Ожидаем пока хост выберет видео'
                    }
                  </p>
                </div>
                {user.isHost && <VideoUpload onVideoSelect={handleVideoSelect} />}
              </div>
            )}
            
            {user.isHost && currentVideo && (
              <div className="mt-4">
                <VideoUpload onVideoSelect={handleVideoSelect} />
              </div>
            )}
          </div>
          
          {/* Чат */}
          <div className="lg:col-span-1 order-2 lg:order-3">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={user}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room