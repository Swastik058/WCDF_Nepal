import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import Donate from '../pages/Donate'
import Dashboard from '../pages/Dashboard'
import Events from '../pages/Events'
import KhaltiVerify from '../pages/KhaltiVerify'
import ProtectedRoute from '../components/ProtectedRoute'
import VolunteerRoute from '../components/VolunteerRoute'
import VolunteerApply from '../pages/VolunteerApply'
import VolunteerDashboard from '../pages/VolunteerDashboard'
import VolunteerProfile from '../pages/VolunteerProfile'
import VolunteerHours from '../pages/VolunteerHours'
import VolunteerActivities from '../pages/VolunteerActivities'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/events" element={<Events />} />
      <Route
        path="/donate"
        element={
          <ProtectedRoute>
            <Donate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/khalti/verify"
        element={
          <ProtectedRoute>
            <KhaltiVerify />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/apply"
        element={
          <ProtectedRoute>
            <VolunteerApply />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/dashboard"
        element={
          <ProtectedRoute>
            <VolunteerRoute>
              <VolunteerDashboard />
            </VolunteerRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/profile"
        element={
          <ProtectedRoute>
            <VolunteerRoute>
              <VolunteerProfile />
            </VolunteerRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/hours"
        element={
          <ProtectedRoute>
            <VolunteerRoute>
              <VolunteerHours />
            </VolunteerRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/activities"
        element={
          <ProtectedRoute>
            <VolunteerRoute>
              <VolunteerActivities />
            </VolunteerRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
