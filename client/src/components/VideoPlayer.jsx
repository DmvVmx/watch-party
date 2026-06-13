import React, { forwardRef, useRef, useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Loader2
} from 'lucide-react'

const VideoPlayer = forwardRef(({ video, videoState, isHost, onStateChange }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  
  const containerRef = useRef(null)
  const progressRef = useRef(null)
  const controlsTimeout = useRef(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      if (isHost) {
        const newTime = video.currentTime
        setCurrentTime(newTime)
        onStateChange({
          currentTime: newTime,
          playing: !video.paused,
          duration: video.duration
        })
      } else {
        setCurrentTime(video.currentTime)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsBuffering(false)
      
      // Если это хост, отправляем событие синхронизации
      if (isHost) {
        onStateChange({
          currentTime: video.currentTime,
          playing: true,
          duration: video.duration
        })
      }
    }

    const handlePause = () => {
      setIsPlaying(false)
      
      // Если это хост, отправляем событие синхронизации
      if (isHost) {
        onStateChange({
          currentTime: video.currentTime,
          playing: false,
          duration: video.duration
        })
      }
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handleCanPlay = () => {
      setIsBuffering(false)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [ref, isHost, onStateChange])

  const togglePlayPause = () => {
    if (!isHost) {
      showHostOnlyMessage()
      return
    }
    
    const video = ref.current
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleSeek = (e) => {
    if (!isHost) {
      showHostOnlyMessage()
      return
    }
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    ref.current.currentTime = newTime
  }

  const skipTime = (seconds) => {
    if (!isHost) {
      showHostOnlyMessage()
      return
    }
    const video = ref.current
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
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

  const toggleMute = () => {
    const video = ref.current
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    ref.current.volume = newVolume
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden aspect-video group"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={ref}
        src={video?.url}
        className="w-full h-full object-cover"
        preload="metadata"
        onClick={isHost ? togglePlayPause : undefined}
        style={{ pointerEvents: isHost ? 'auto' : 'none' }}
      />

      {/* Загрузка */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <span className="text-white text-lg">
              {isLoading ? 'Загрузка...' : 'Буферизация...'}
            </span>
          </div>
        </div>
      )}

      {/* Центральная кнопка воспроизведения */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className={`bg-white/20 backdrop-blur-md rounded-full p-6 hover:bg-white/30 transition-all duration-200 ${
              !isHost ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
            disabled={!isHost}
          >
            <Play className="w-16 h-16 text-white ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Панель управления */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}>
        
        {/* Прогресс бар */}
        <div className="mb-4">
          <div 
            ref={progressRef}
            className={`w-full h-2 bg-white/20 rounded-full group/progress transition-all duration-200 ${
              isHost ? 'cursor-pointer hover:h-3' : 'cursor-not-allowed'
            }`}
            onClick={handleSeek}
          >
            <div 
              className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-150 ${
                isHost ? 'group-hover/progress:h-3' : ''
              }`}
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Управляющие элементы */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Основные кнопки */}
            <button
              onClick={() => skipTime(-10)}
              disabled={!isHost}
              className={`text-white hover:text-purple-400 transition-colors ${
                !isHost ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlayPause}
              disabled={!isHost}
              className={`text-white hover:text-purple-400 transition-colors ${
                !isHost ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>

            <button
              onClick={() => skipTime(10)}
              disabled={!isHost}
              className={`text-white hover:text-purple-400 transition-colors ${
                !isHost ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <SkipForward className="w-6 h-6" />
            </button>

            {/* Время */}
            <div className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Громкость */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer volume-slider"
              />
            </div>

            {/* Полный экран */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-purple-400 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Статус управления */}
        <div className="absolute top-4 right-4">
          {isHost ? (
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-1 backdrop-blur-md">
              <span className="text-green-300 text-sm font-medium">👑 Вы управляете</span>
            </div>
          ) : (
            <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg px-3 py-1 backdrop-blur-md">
              <span className="text-orange-300 text-sm font-medium">👥 Управляет хост</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
        }
        
        .volume-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer