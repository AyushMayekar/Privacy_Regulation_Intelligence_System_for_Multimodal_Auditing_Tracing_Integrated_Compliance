import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import './styles/chat.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


