import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import {
  FiLogOut,
  FiShield,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
} from 'react-icons/fi'
import api from '../../services/api'
import { toast } from 'react-toastify'

const AdminJobs = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, open, closed
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const jobsPerPage = 9

  useEffect(() => {
    fetchJobs()
  }, [filter, currentPage])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const statusParam =
        filter === 'all' ? '' : filter === 'open' ? 'open' : 'closed'
      const response = await api.get(
        `/admin/jobs?status=${statusParam}&page=${currentPage}&limit=${jobsPerPage}`
      )
      setJobs(response.data.data.jobs)
      setTotalPages(response.data.data.pagination.pages)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      // Mock data for demonstration
      const mockJobs = [
        {
          _id: '1',
          title: 'Senior Full Stack Developer',
          location: 'San Francisco, CA',
          jobType: 'Full-time',
          experienceLevel: 'Senior',
          description:
            'We are looking for an experienced Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
          requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          status: 'open',
          applicationCount: 24,
          postedBy: {
            name: 'Tech Corp',
            email: 'hr@techcorp.com',
          },
          createdAt: '2024-02-01T10:00:00Z',
        },
        {
          _id: '2',
          title: 'Frontend Developer',
          location: 'Remote',
          jobType: 'Full-time',
          experienceLevel: 'Mid-level',
          description:
            'Join our team as a Frontend Developer and help build beautiful, responsive web applications. Experience with React and modern CSS frameworks required.',
          requiredSkills: ['React', 'JavaScript', 'CSS', 'Tailwind'],
          status: 'open',
          applicationCount: 18,
          postedBy: {
            name: 'StartupXYZ',
            email: 'jobs@startupxyz.com',
          },
          createdAt: '2024-02-05T14:30:00Z',
        },
        {
          _id: '3',
          title: 'Backend Engineer',
          location: 'New York, NY',
          jobType: 'Full-time',
          experienceLevel: 'Senior',
          description:
            'We need a Backend Engineer with strong experience in Node.js and database management. You will design and implement scalable backend services.',
          requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
          status: 'closed',
          applicationCount: 31,
          postedBy: {
            name: 'Enterprise Inc',
            email: 'careers@enterprise.com',
          },
          createdAt: '2024-01-15T09:00:00Z',
        },
        {
          _id: '4',
          title: 'DevOps Engineer',
          location: 'Austin, TX',
          jobType: 'Full-time',
          experienceLevel: 'Mid-level',
          description:
            'Looking for a DevOps Engineer to manage our infrastructure and CI/CD pipelines. Experience with AWS and Kubernetes is essential.',
          requiredSkills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD'],
          status: 'open',
          applicationCount: 15,
          postedBy: {
            name: 'Cloud Solutions',
            email: 'hiring@cloudsolutions.com',
          },
          createdAt: '2024-02-10T11:00:00Z',
        },
        {
          _id: '5',
          title: 'UI/UX Designer',
          location: 'Los Angeles, CA',
          jobType: 'Contract',
          experienceLevel: 'Mid-level',
          description:
            'We are seeking a creative UI/UX Designer to design intuitive user interfaces and engaging user experiences for our products.',
          requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
          status: 'open',
          applicationCount: 22,
          postedBy: {
            name: 'Design Studio',
            email: 'contact@designstudio.com',
          },
          createdAt: '2024-02-12T15:45:00Z',
        },
        {
          _id: '6',
          title: 'Data Scientist',
          location: 'Boston, MA',
          jobType: 'Full-time',
          experienceLevel: 'Senior',
          description:
            'Join our data team as a Data Scientist. You will analyze complex datasets, build predictive models, and derive actionable insights.',
          requiredSkills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
          status: 'closed',
          applicationCount: 27,
          postedBy: {
            name: 'Analytics Corp',
            email: 'jobs@analyticscorp.com',
          },
          createdAt: '2024-01-20T10:30:00Z',
        },
      ]

      const filteredJobs =
        filter === 'all'
          ? mockJobs
          : mockJobs.filter((j) => j.status === filter)

      setJobs(filteredJobs)
      setTotalPages(Math.ceil(filteredJobs.length / jobsPerPage))
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this job? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      await api.delete(`/admin/jobs/${jobId}`)
      toast.success('Job deleted successfully')
      fetchJobs()
    } catch (error) {
      toast.error('Failed to delete job')
      console.error('Error deleting job:', error)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
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
                  className="text-primary-600 font-semibold px-3 py-2 rounded-md"
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
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
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
            Job Management
          </h2>
          <p className="text-gray-600">
            Monitor and manage all job postings on the platform
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium text-gray-700">Filter by Status:</span>
            <button
              onClick={() => {
                setFilter('all')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => {
                setFilter('open')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'open'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Open Jobs
            </button>
            <button
              onClick={() => {
                setFilter('closed')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'closed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Closed Jobs
            </button>
            <div className="ml-auto text-sm text-gray-600">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <FiBriefcase className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No jobs found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {jobs.map((job) => (
                <div key={job._id} className="card hover:shadow-lg transition-shadow">
                  {/* Job Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {job.recruiterId?.fullName || 'Unknown Recruiter'}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        job.status === 'open' ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiBriefcase className="mr-2" />
                      {job.jobType} - {job.experienceLevel}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUsers className="mr-2" />
                      {job.applicationCount} application
                      {job.applicationCount !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="mr-2" />
                      Posted {formatDate(job.createdAt)}
                    </div>
                  </div>

                  {/* Job Description */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Required Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="badge badge-info text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="badge badge-info text-xs">
                          +{job.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="w-full btn btn-danger flex items-center justify-center space-x-2"
                    >
                      <FiTrash2 />
                      <span>Delete Job</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <FiChevronLeft />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default AdminJobs
