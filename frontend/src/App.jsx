import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TimPage from './pages/TimPage'
import TugasPage from './pages/TugasPage'
import AbsensiPage from './pages/AbsensiPage'
import LaporanPage from './pages/LaporanPage'
import AIInsightPage from './pages/AIInsightPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { fetchMe, authLoading } = useAuthStore()

  useEffect(() => {
    fetchMe()
  }, [])

  if (authLoading) return null

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '13px' } }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/tim" element={<ProtectedRoute><TimPage /></ProtectedRoute>} />
        <Route path="/tugas" element={<ProtectedRoute><TugasPage /></ProtectedRoute>} />
        <Route path="/absensi" element={<ProtectedRoute><AbsensiPage /></ProtectedRoute>} />
        <Route path="/laporan" element={<ProtectedRoute><LaporanPage /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIInsightPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}