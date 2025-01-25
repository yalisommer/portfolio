import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import SharkTrackerApp from '@shark-tracker/App'
import Sidebar from './components/Sidebar'
import '@shark-tracker/App.css'
import 'ol/ol.css'
import './style.css'

function App() {
  const location = useLocation();
  const isSharkTracker = location.pathname.includes('/shark-tracker');

  return (
    <div className="app" style={{ 
      backgroundColor: isSharkTracker ? '#242424' : '#FFF3D4',
      minHeight: '100vh',
      color: isSharkTracker ? 'rgba(255, 255, 255, 0.87)' : 'inherit'
    }}>
      <Sidebar />
      <main>
        <Routes>
          <Route path="/portfolio" element={<Home />} />
          <Route path="/portfolio/shark-tracker" element={<SharkTrackerApp />} />
          <Route path="/" element={<Home />} />
          <Route path="/shark-tracker" element={<SharkTrackerApp />} />
        </Routes>
      </main>
    </div>
  )
}

export default App