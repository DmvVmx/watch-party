import React, { useState } from 'react'
import { Copy, Check, Share2, Users, ArrowLeft, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RoomHeader = ({ room, user }) => {
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/room/${room.id}`
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback для браузеров без поддержки clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = inviteLink
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const leaveRoom = () => {
    navigate('/')
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={leaveRoom}
            className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#f0f6fc] p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-[#f0f6fc]">
                Комната {room.id}
              </h1>
              {user.isHost && (
                <span className="bg-[#ffd33d]/10 text-[#ffd33d] text-xs px-2 py-1 rounded-full border border-[#ffd33d]/20 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Хост
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-[#7d8590]">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{room.participants.length} участников</span>
              </div>
              {room.currentVideo && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#3fb950] rounded-full"></div>
                  <span>Воспроизводится: {room.currentVideo.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={copyInviteLink}
          className={`bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            copied ? 'bg-[#3fb950]' : ''
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Скопировано!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Пригласить
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default RoomHeader