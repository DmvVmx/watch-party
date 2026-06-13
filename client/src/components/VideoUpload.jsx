import React, { useState, useRef } from 'react'
import { Upload, Link2, Film, Check } from 'lucide-react'

const VideoUpload = ({ onVideoSelect }) => {
  const [activeTab, setActiveTab] = useState('url')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleUrlSubmit = async (e) => {
    e.preventDefault()
    if (!videoUrl.trim() || !isValidUrl(videoUrl.trim())) return

    setLoading(true)
    
    // Просто передаем URL, браузер сам определит поддерживается ли видео
    onVideoSelect({
      url: videoUrl.trim(),
      title: `Видео ${new Date().toLocaleString('ru-RU')}`,
      type: 'url'
    })
    setVideoUrl('')
    setLoading(false)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Пожалуйста, выберите видеофайл')
      return
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB
      alert('Файл слишком большой. Максимум 500MB')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        onVideoSelect({
          url: result.url, // Уберем window.location.origin - прокси сам всё обработает
          title: result.filename,
          type: 'file'
        })
      } else {
        alert(result.error || 'Ошибка загрузки файла')
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка загрузки файла')
    }

    setLoading(false)
  }

  const isValidUrl = (string) => {
    try {
      const url = new URL(string)
      // Проверяем что это http/https протокол
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (_) {
      return false
    }
  }

  const showHostOnlyMessage = () => {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg z-50 animate-bounce'
    notification.textContent = 'Только хост может управлять видео'
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Film className="w-5 h-5 text-[#7d8590]" />
        <h3 className="text-[#f0f6fc] font-medium">Выбрать видео</h3>
      </div>

      {/* Табы */}
      <div className="flex mb-6 bg-[#21262d] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'url'
              ? 'bg-[#238636] text-white'
              : 'text-[#7d8590] hover:text-[#f0f6fc]'
          }`}
        >
          <Link2 className="w-4 h-4" />
          По ссылке
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'file'
              ? 'bg-[#238636] text-white'
              : 'text-[#7d8590] hover:text-[#f0f6fc]'
          }`}
        >
          <Upload className="w-4 h-4" />
          Загрузить файл
        </button>
      </div>

      {/* Контент табов */}
      {activeTab === 'url' ? (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-[#f0f6fc] text-sm font-medium mb-2">
              Ссылка на видео
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full bg-[#0d1117] border border-[#30363d] text-[#f0f6fc] placeholder-[#7d8590] py-3 px-4 rounded-lg focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!videoUrl.trim() || !isValidUrl(videoUrl) || loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Загрузка...' : 'Загрузить видео'}
          </button>

          <div className="text-xs text-[#6e7681]">
            <p>Поддерживаются: MP4, WebM, OGG, и другие форматы</p>
            <p>Вставьте прямую ссылку на видеофайл</p>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full border-2 border-dashed border-[#30363d] rounded-lg p-8 hover:border-[#2f81f7] transition-colors duration-200 group disabled:opacity-50"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-[#6e7681] group-hover:text-[#2f81f7] mx-auto mb-4 transition-colors duration-200" />
              <p className="text-[#f0f6fc] font-medium mb-2">
                {loading ? 'Загружается...' : 'Выберите видеофайл'}
              </p>
              <p className="text-[#7d8590] text-sm">MP4, WebM, OGG до 500MB</p>
            </div>
          </button>

          <div className="text-xs text-[#6e7681]">
            <p>Файл будет загружен на сервер и доступен всем участникам</p>
            <p>Загрузка может занять время в зависимости от размера файла</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoUpload