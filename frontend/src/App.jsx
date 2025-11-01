import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/Route/ProtectedRoute'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import CandidateDashboard from './pages/Candidate/Dashboard'
import CandidateProfile from './pages/Candidate/Profile'
import CandidateApplications from './pages/Candidate/Applications'
import CandidateApplicationDetail from './pages/Candidate/ApplicationDetail'
import RecruiterDashboard from './pages/Recruiter/Dashboard'
import RecruiterCreateJob from './pages/Recruiter/CreateJob'
import RecruiterMyJobs from './pages/Recruiter/MyJobs'
import RecruiterJobDetail from './pages/Recruiter/JobDetail'
import RecruiterEditJob from './pages/Recruiter/EditJob'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminUsers from './pages/Admin/Users'
import AdminJobs from './pages/Admin/Jobs'
import BrowseJobs from './pages/Jobs/BrowseJobs'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/browse-jobs" element={<BrowseJobs />} />

      {/* Candidate Routes */}
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/profile"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <CandidateProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/applications"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <CandidateApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/applications/:id"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <CandidateApplicationDetail />
          </ProtectedRoute>
        }
      />

      {/* Recruiter Routes */}
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/new"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterCreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterMyJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/:id"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterJobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterEditJob />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminJobs />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
