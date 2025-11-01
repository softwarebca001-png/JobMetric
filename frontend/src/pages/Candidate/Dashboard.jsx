import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import {
  FiLogOut,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiUpload,
} from 'react-icons/fi'
import api from '../../services/api'

const CandidateDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    totalApplications: 0,
    shortlisted: 0,
    interviewed: 0,
    pending: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // This would be an actual API call in production
      // const response = await api.get('/candidate/stats')
      // setStats(response.data)

      // Mock data for now
      setStats({
        totalApplications: 12,
        shortlisted: 5,
        interviewed: 2,
        pending: 5,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleBrowseJobs = () => {
    navigate('/browse-jobs')
  }

  const handleUploadResume = () => {
    navigate('/candidate/profile')
  }

  const handleViewApplications = () => {
    navigate('/candidate/applications')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">JobMetric</h1>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700 font-medium">
                Candidate Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your job applications
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Applications
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalApplications}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <FiFileText className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Shortlisted
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.shortlisted}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <FiCheckCircle className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Interviewed
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.interviewed}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <FiBriefcase className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-full">
                <FiClock className="text-white text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleBrowseJobs}
              className="btn btn-primary flex items-center justify-center space-x-2 py-4 hover:opacity-90"
            >
              <FiSearch className="text-xl" />
              <span>Browse Jobs</span>
            </button>
            <button
              onClick={handleUploadResume}
              className="btn btn-primary flex items-center justify-center space-x-2 py-4 hover:opacity-90"
            >
              <FiUpload className="text-xl" />
              <span>Upload Resume</span>
            </button>
            <button
              onClick={handleViewApplications}
              className="btn btn-primary flex items-center justify-center space-x-2 py-4 hover:opacity-90"
            >
              <FiFileText className="text-xl" />
              <span>View Applications</span>
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Recent Applications
          </h3>
          <div className="text-center py-8 text-gray-500">
            <FiFileText className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No recent applications</p>
            <p className="text-sm mt-2">
              Start applying to jobs to see them here
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CandidateDashboard
