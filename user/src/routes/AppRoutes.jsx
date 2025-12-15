import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Donate from '../pages/Donate'
import Booking from '../pages/Booking'
import ProtectedRoute from '../components/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/donate"
        element={
          <ProtectedRoute>
            <Donate />
          </ProtectedRoute>
        }
      />
      <Route path="/booking" element={<Booking />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes

