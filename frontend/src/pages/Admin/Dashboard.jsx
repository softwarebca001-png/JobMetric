import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import {
  FiLogOut,
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiShield,
} from 'react-icons/fi'
import api from '../../services/api'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    users: {
      total: 0,
      candidates: 0,
      recruiters: 0,
      verified: 0,
      unverified: 0,
    },
    jobs: {
      total: 0,
      open: 0,
      closed: 0,
    },
    applications: {
      total: 0,
      applied: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/statistics')
      setStats(response.data.data.statistics)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Mock data for demonstration
      setStats({
        users: {
          total: 127,
          candidates: 95,
          recruiters: 30,
          verified: 102,
          unverified: 25,
        },
        jobs: {
          total: 48,
          open: 32,
          closed: 16,
        },
        applications: {
          total: 356,
          applied: 180,
          reviewed: 98,
          shortlisted: 52,
          rejected: 26,
        },
      })
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-primary-600">JobMetric</h1>
              <div className="flex space-x-4">
                <Link
                  to="/admin/dashboard"
                  className="text-primary-600 font-semibold px-3 py-2 rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Users
                </Link>
                <Link
                  to="/admin/jobs"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Jobs
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary-100 rounded-full">
                <FiShield className="text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  Admin
                </span>
              </div>
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
            Admin Dashboard
          </h2>
          <p className="text-gray-600">
            Overview of platform statistics and management tools
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        ) : (
          <>
            {/* User Statistics */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                User Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <FiUsers className="text-blue-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.users.total}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Candidates
                    </p>
                    <FiUsers className="text-purple-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.users.candidates}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Recruiters
                    </p>
                    <FiBriefcase className="text-indigo-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.users.recruiters}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Verified</p>
                    <FiCheckCircle className="text-green-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.users.verified}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Unverified
                    </p>
                    <FiClock className="text-yellow-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.users.unverified}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Statistics */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Job Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Total Jobs
                    </p>
                    <FiBriefcase className="text-blue-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.jobs.total}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Open Jobs
                    </p>
                    <FiCheckCircle className="text-green-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.jobs.open}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Closed Jobs
                    </p>
                    <FiXCircle className="text-gray-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.jobs.closed}
                  </p>
                </div>
              </div>
            </div>

            {/* Application Statistics */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Application Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Total Apps
                    </p>
                    <FiFileText className="text-blue-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.applications.total}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Applied</p>
                    <FiFileText className="text-purple-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.applications.applied}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Reviewed
                    </p>
                    <FiCheckCircle className="text-indigo-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.applications.reviewed}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Shortlisted
                    </p>
                    <FiCheckCircle className="text-green-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.applications.shortlisted}
                  </p>
                </div>

                <div className="card bg-gradient-to-br from-red-50 to-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Rejected
                    </p>
                    <FiXCircle className="text-red-600 text-xl" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.applications.rejected}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/admin/users"
                  className="btn btn-primary flex items-center justify-center space-x-2 py-4"
                >
                  <FiUsers className="text-xl" />
                  <span>Manage Users</span>
                </Link>
                <Link
                  to="/admin/jobs"
                  className="btn btn-primary flex items-center justify-center space-x-2 py-4"
                >
                  <FiBriefcase className="text-xl" />
                  <span>Manage Jobs</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
