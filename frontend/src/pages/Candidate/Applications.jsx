import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import { toast } from 'react-toastify'
import {
  FiLogOut,
  FiFileText,
  FiChevronRight,
} from 'react-icons/fi'
import api from '../../services/api'

const ApplicationsPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, activeFilter])

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications')
      if (response.data.success) {
        setApplications(response.data.data.applications || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (activeFilter !== 'all') {
      filtered = applications.filter((app) => app.status === activeFilter)
    }

    setFilteredApplications(filtered)
    setCurrentPage(1)
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-700'
      case 'reviewed':
        return 'bg-purple-100 text-purple-700'
      case 'shortlisted':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      case 'selected':
        return 'bg-emerald-100 text-emerald-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
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
                My Applications
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
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            My Applications
          </h2>
          <p className="text-gray-600">
            Track all your job applications and their status
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {['all', 'applied', 'reviewed', 'shortlisted', 'rejected', 'selected'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeFilter === filter
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                <span className="ml-2 text-sm">
                  ({filter === 'all'
                    ? applications.length
                    : applications.filter((app) => app.status === filter).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {paginatedApplications.length > 0 ? (
            paginatedApplications.map((application) => (
              <Link
                key={application._id}
                to={`/candidate/applications/${application._id}`}
                className="card hover:shadow-md transition block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <FiFileText className="text-primary-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.jobId?.title || 'Job Title'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {application.jobId?.company || 'Company'} •{' '}
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(application.scores?.finalScore || 0)}%
                      </div>
                      <p className="text-xs text-gray-500">Match Score</p>
                    </div>

                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    <FiChevronRight className="text-gray-400" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="card text-center py-12">
              <FiFileText className="text-5xl mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-gray-500 text-lg mb-2">
                {activeFilter === 'all'
                  ? "You haven't applied to any jobs yet"
                  : `No ${activeFilter} applications`}
              </p>
              <Link
                to="/candidate/dashboard"
                className="inline-block mt-4 text-primary hover:text-blue-600 font-medium"
              >
                Browse Jobs →
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === page
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default ApplicationsPage
