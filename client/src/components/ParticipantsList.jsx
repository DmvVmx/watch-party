import React from 'react'
import { Users, Crown, User, Circle } from 'lucide-react'

const ParticipantsList = ({ participants }) => {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#7d8590]" />
        <h3 className="text-[#f0f6fc] font-medium">Участники</h3>
        <span className="bg-[#21262d] text-[#7d8590] text-xs px-2 py-1 rounded-full">
          {participants.length}
        </span>
      </div>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div 
            key={participant.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#21262d] transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-[#2f81f7] to-[#a855f7] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {participant.isHost && (
                <div className="absolute -top-1 -right-1 bg-[#ffd33d] rounded-full p-0.5">
                  <Crown className="w-2.5 h-2.5 text-[#0d1117]" />
                </div>
              )}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d1117] ${
                participant.connected ? 'bg-[#3fb950]' : 'bg-[#6e7681]'
              }`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[#f0f6fc] text-sm font-medium truncate">
                  {participant.name}
                </span>
                {participant.isHost && (
                  <span className="bg-[#ffd33d]/10 text-[#ffd33d] text-xs px-1.5 py-0.5 rounded">
                    Хост
                  </span>
                )}
              </div>
              <div className="text-xs text-[#7d8590]">
                {participant.connected ? 'Онлайн' : 'Оффлайн'}
              </div>
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="text-center text-[#6e7681] py-8">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет участников</p>
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="mt-4 pt-4 border-t border-[#30363d]">
        <div className="text-xs text-[#6e7681] text-center">
          Максимум 10 участников
        </div>
      </div>
    </div>
  )
}

export default ParticipantsList