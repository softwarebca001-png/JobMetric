import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import { toast } from 'react-toastify'
import {
  FiLogOut,
  FiBriefcase,
  FiChevronRight,
  FiPlus,
  FiEdit2,
  FiEye,
  FiTrash2,
} from 'react-icons/fi'
import api from '../../services/api'

const MyJobsPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, activeFilter])

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/recruiter/my-jobs')
      if (response.data.success) {
        setJobs(response.data.data.jobs || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to load jobs')
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    if (activeFilter === 'open') {
      filtered = jobs.filter((job) => job.status === 'open')
    } else if (activeFilter === 'closed') {
      filtered = jobs.filter((job) => job.status === 'closed')
    }

    setFilteredJobs(filtered)
    setCurrentPage(1)
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return
    }

    setDeletingId(jobId)
    try {
      const response = await api.delete(`/jobs/${jobId}`)
      if (response.data.success) {
        toast.success('Job deleted successfully')
        setJobs(jobs.filter((job) => job._id !== jobId))
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open'
      const response = await api.patch(`/jobs/${jobId}`, {
        status: newStatus,
      })
      if (response.data.success) {
        toast.success(`Job ${newStatus} successfully`)
        setJobs(
          jobs.map((job) =>
            job._id === jobId ? { ...job, status: newStatus } : job
          )
        )
      }
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job status')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
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
                My Jobs
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              My Jobs
            </h2>
            <p className="text-gray-600">
              Manage all your job postings
            </p>
          </div>
          <Link
            to="/recruiter/jobs/new"
            className="btn btn-primary flex items-center space-x-2"
          >
            <FiPlus />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {['all', 'open', 'closed'].map((filter) => (
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
                    ? jobs.length
                    : jobs.filter((job) => job.status === filter).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {paginatedJobs.length > 0 ? (
            paginatedJobs.map((job) => (
              <div
                key={job._id}
                className="card hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <FiBriefcase className="text-primary-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {job.location} • Posted{' '}
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600">Applications</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {job.applicationCount || 0}
                        </p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          job.status === 'open'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/recruiter/jobs/${job._id}`}
                      className="btn btn-secondary text-sm flex items-center gap-1 px-3 py-2"
                      title="View"
                    >
                      <FiEye size={16} />
                    </Link>
                    <Link
                      to={`/recruiter/jobs/${job._id}/edit`}
                      className="btn btn-secondary text-sm flex items-center gap-1 px-3 py-2"
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      className="btn btn-secondary text-sm px-3 py-2"
                      title={job.status === 'open' ? 'Close Job' : 'Reopen Job'}
                    >
                      {job.status === 'open' ? 'Close' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      disabled={deletingId === job._id}
                      className="btn btn-danger text-sm flex items-center gap-1 px-3 py-2 disabled:opacity-50"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <FiBriefcase className="text-5xl mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-gray-500 text-lg mb-2">
                {activeFilter === 'all'
                  ? "You haven't posted any jobs yet"
                  : `No ${activeFilter} jobs`}
              </p>
              <Link
                to="/recruiter/jobs/new"
                className="inline-block mt-4 btn btn-primary"
              >
                Post Your First Job
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

export default MyJobsPage
