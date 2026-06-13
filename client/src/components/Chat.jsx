import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle } from 'lucide-react'

const Chat = ({ messages, onSendMessage, currentUser }) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    onSendMessage(newMessage.trim())
    setNewMessage('')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg h-96 flex flex-col">
      {/* Заголовок чата */}
      <div className="p-4 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#7d8590]" />
          <h3 className="text-[#f0f6fc] font-medium">Чат</h3>
          {messages.length > 0 && (
            <span className="bg-[#21262d] text-[#7d8590] text-xs px-2 py-1 rounded-full">
              {messages.length}
            </span>
          )}
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-[#6e7681] mt-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Сообщений пока нет</p>
            <p className="text-xs mt-1">Начните общение!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="animate-slide-up">
              <div className={`flex ${
                message.userId === currentUser.id ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.userId === currentUser.id
                    ? 'bg-[#238636] text-white'
                    : 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                }`}>
                  {message.userId !== currentUser.id && (
                    <div className="text-xs text-[#7d8590] mb-1 font-medium">
                      {message.userName}
                    </div>
                  )}
                  <div className="break-words text-sm">{message.text}</div>
                  <div className={`text-xs mt-1 ${
                    message.userId === currentUser.id ? 'text-white/70' : 'text-[#6e7681]'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-4 border-t border-[#30363d]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Написать сообщение..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] text-[#f0f6fc] placeholder-[#7d8590] py-2 px-3 rounded-lg focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] focus:outline-none transition-colors"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] disabled:text-[#484f58] text-white p-2 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-xs text-[#6e7681] mt-2">
          {newMessage.length}/500
        </div>
      </div>
    </div>
  )
}

export default Chat