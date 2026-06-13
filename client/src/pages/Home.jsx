import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { Play, Users, Plus, ArrowRight, Github } from 'lucide-react'

const Home = () => {
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { socket, connected } = useSocket()

  // Загружаем сохраненное имя пользователя
  useEffect(() => {
    const savedName = localStorage.getItem('watchparty-username')
    if (savedName) {
      setUserName(savedName)
    }
  }, [])

  const createRoom = () => {
    if (!userName.trim()) return
    setLoading(true)
    
    // Сохраняем имя пользователя
    localStorage.setItem('watchparty-username', userName.trim())
    
    socket.emit('create-room', { userName: userName.trim() }, (response) => {
      setLoading(false)
      if (response.success) {
        navigate(`/room/${response.roomId}`)
      }
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userName.trim() && connected && !loading) {
      createRoom()
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#21262d] border border-[#30363d] rounded-full p-4">
              <Play className="w-12 h-12 text-[#2f81f7]" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#2f81f7] to-[#a855f7] bg-clip-text text-transparent">
            Watch Party
          </h1>
          <p className="text-xl text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Смотрите фильмы и видео вместе с друзьями в режиме реального времени. 
            Синхронизированное воспроизведение, чат и простые приглашения.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-md mx-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl">
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#f0f6fc] mb-3">
                Ваше имя
              </label>
              <input
                type="text"
                placeholder="Введите ваше имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!connected}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white placeholder-[#7d8590] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] focus:outline-none transition-colors"
                maxLength={50}
              />
            </div>

            <button
              onClick={createRoom}
              disabled={!userName.trim() || !connected || loading}
              className="w-full bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Создание...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Создать комнату
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Connection Status */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#3fb950]' : 'bg-[#f85149]'}`}></div>
              <span className="text-[#7d8590]">
                {connected ? 'Подключено к серверу' : 'Подключение к серверу...'}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid gap-6 text-center">
            <div className="flex items-center justify-center gap-4 text-[#8b949e]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2f81f7]" />
                <span className="text-sm">До 10 участников</span>
              </div>
              <div className="w-1 h-1 bg-[#30363d] rounded-full"></div>
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#2f81f7]" />
                <span className="text-sm">Синхронизация</span>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-[#f0f6fc]">
            Как это работает
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#21262d] border border-[#30363d] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#2f81f7] font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-[#f0f6fc]">Создайте комнату</h3>
              <p className="text-[#8b949e] text-sm">
                Введите ваше имя и создайте новую комнату для просмотра
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#21262d] border border-[#30363d] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#2f81f7] font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-[#f0f6fc]">Пригласите друзей</h3>
              <p className="text-[#8b949e] text-sm">
                Скопируйте ссылку и отправьте друзьям для присоединения
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#21262d] border border-[#30363d] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#2f81f7] font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-[#f0f6fc]">Смотрите вместе</h3>
              <p className="text-[#8b949e] text-sm">
                Загрузите видео и наслаждайтесь синхронным просмотром
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home