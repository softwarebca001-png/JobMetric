import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import { toast } from 'react-toastify'
import {
  FiLogOut,
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiEdit2,
  FiArrowLeft,
  FiUsers,
  FiMail,
  FiPhone,
  FiFileText,
} from 'react-icons/fi'
import api from '../../services/api'

const JobDetailPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])

  useEffect(() => {
    fetchJobDetails()
    fetchApplications()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`)
      if (response.data.success) {
        setJob(response.data.data.job)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching job:', error)
      toast.error('Failed to load job details')
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await api.get(`/jobs/${id}/applications`)
      if (response.data.success) {
        setApplications(response.data.data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Job not found</p>
          <Link to="/recruiter/jobs" className="btn btn-primary mt-4">
            Back to My Jobs
          </Link>
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
              <span className="ml-4 text-gray-700 font-medium">Job Details</span>
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
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="flex items-center text-primary hover:text-blue-600 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to My Jobs
        </button>

        {/* Job Details */}
        <div className="card mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <FiMapPin className="mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <FiBriefcase className="mr-2" />
                  {job.jobType}
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-2" />
                  Posted {formatDate(job.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  job.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
              <Link
                to={`/recruiter/jobs/${id}/edit`}
                className="btn btn-primary flex items-center space-x-2"
              >
                <FiEdit2 />
                <span>Edit Job</span>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Experience Level
              </h3>
              <p className="text-gray-900">{job.experienceLevel}</p>
            </div>
            {(job.minSalary || job.maxSalary) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Salary Range
                </h3>
                <div className="flex items-center text-gray-900">
                  <FiDollarSign />
                  {job.minSalary && job.maxSalary
                    ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`
                    : job.minSalary
                    ? `From ${job.minSalary.toLocaleString()}`
                    : `Up to ${job.maxSalary.toLocaleString()}`}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Description
            </h3>
            <p className="text-gray-900 whitespace-pre-line">{job.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Requirements
            </h3>
            <p className="text-gray-900 whitespace-pre-line">{job.requirements}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No skills listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FiUsers className="text-2xl text-primary-600 mr-3" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Applications</h3>
                <p className="text-gray-600">
                  {applications.length} candidate{applications.length !== 1 ? 's' : ''} applied
                </p>
              </div>
            </div>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {application.candidateId?.fullName || 'Unknown Candidate'}
                      </h4>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        {application.candidateId?.email && (
                          <div className="flex items-center">
                            <FiMail className="mr-2" />
                            {application.candidateId.email}
                          </div>
                        )}
                        {application.candidateId?.phone && (
                          <div className="flex items-center">
                            <FiPhone className="mr-2" />
                            {application.candidateId.phone}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            application.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : application.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Applied {formatDate(application.createdAt)}
                        </span>
                      </div>
                      {application.coverLetter && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-600 mb-1">
                            Cover Letter:
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>
                    {application.resume && (
                      <a
                        href={application.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary text-sm flex items-center space-x-2 ml-4"
                      >
                        <FiFileText />
                        <span>View Resume</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FiUsers className="text-5xl mx-auto mb-4 opacity-50" />
              <p>No applications yet</p>
              <p className="text-sm mt-2">
                Candidates will appear here once they apply to this job
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default JobDetailPage
