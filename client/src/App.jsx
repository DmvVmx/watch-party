import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Room from './pages/Room'
import { SocketProvider } from './context/SocketContext'

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-[#0d1117]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  )
}

export default App