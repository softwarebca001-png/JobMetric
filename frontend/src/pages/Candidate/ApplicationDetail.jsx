import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import { toast } from 'react-toastify'
import {
  FiLogOut,
  FiArrowLeft,
  FiDownload,
  FiCheckCircle,
  FiX,
  FiTrendingUp,
} from 'react-icons/fi'
import api from '../../services/api'

const ApplicationDetailPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState(null)
  const [scoreDetailsOpen, setScoreDetailsOpen] = useState(false)

  useEffect(() => {
    fetchApplicationDetail()
  }, [id])

  const fetchApplicationDetail = async () => {
    try {
      const response = await api.get(`/applications/${id}`)
      if (response.data.success) {
        setApplication(response.data.data.application)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching application:', error)
      toast.error('Failed to load application details')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleDownloadResume = async () => {
    try {
      const response = await api.get('/candidates/resume/download', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${user?.fullName}_resume.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume')
    }
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

  const getStatusTimeline = (status) => {
    const statuses = ['applied', 'reviewed', 'shortlisted', 'rejected']
    return statuses.map((s) => ({
      name: s,
      completed:
        s === 'rejected'
          ? status === 'rejected'
          : statuses.indexOf(s) <= Math.max(0, statuses.indexOf(status)),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Application not found</p>
          <Link to="/candidate/applications" className="text-primary hover:text-blue-600">
            Back to Applications
          </Link>
        </div>
      </div>
    )
  }

  const matchPercentage = Math.round(application.scores?.finalScore || 0)
  const timeline = getStatusTimeline(application.status)

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
                Application Details
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/candidate/applications"
          className="flex items-center text-primary hover:text-blue-600 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Applications
        </Link>

        {/* Job Information */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {application.jobId?.title}
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                {application.jobId?.company}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {application.jobId?.location}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Applied Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            {application.reviewedAt && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Reviewed Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(application.reviewedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Match Score */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Your Match Score
          </h3>

          <div className="flex items-center gap-8 mb-6">
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#0066ff"
                    strokeWidth="8"
                    strokeDasharray={`${(matchPercentage / 100) * 440} 440`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{matchPercentage}%</p>
                    <p className="text-xs text-gray-600">Match</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-gray-600 mb-4">
                Your resume matches {matchPercentage}% of the job requirements.
              </p>

              <button
                onClick={() => setScoreDetailsOpen(!scoreDetailsOpen)}
                className="text-primary hover:text-blue-600 font-medium flex items-center gap-2"
              >
                <FiTrendingUp />
                {scoreDetailsOpen ? 'Hide' : 'Show'} Score Breakdown
              </button>
            </div>
          </div>

          {scoreDetailsOpen && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">TF-IDF Score</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {Math.round(application.scores?.tfidfScore || 0)}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, application.scores?.tfidfScore || 0)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">BM25 Score</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {Math.round(application.scores?.bm25Score || 0)}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, application.scores?.bm25Score || 0)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Cosine Similarity</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {(application.scores?.cosineScore || 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (application.scores?.cosineScore || 0) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Keyword Match</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {Math.round(application.scores?.keywordMatchScore || 0)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${application.scores?.keywordMatchScore || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Application Timeline
          </h3>

          <div className="flex items-center justify-between">
            {timeline.map((item, idx) => (
              <div key={item.name} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      item.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.completed ? '✓' : idx + 1}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </p>
                </div>
                {idx < timeline.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      item.completed ? 'bg-green-200' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Matched Skills */}
        {application.matchedSkills && application.matchedSkills.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {application.matchedSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-full"
                >
                  <FiCheckCircle className="text-green-600" />
                  <span className="text-sm text-green-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {application.missingSkills && application.missingSkills.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {application.missingSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-full"
                >
                  <FiX className="text-red-600" />
                  <span className="text-sm text-red-700">{skill}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              💡 <span className="font-semibold">Tip:</span> Consider highlighting
              relevant experience for these skills in your resume.
            </p>
          </div>
        )}

        {/* Feedback */}
        {application.feedback && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              AI Feedback
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {application.feedback}
              </p>
            </div>
          </div>
        )}

        {/* Job Description */}
        {application.jobId?.description && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Job Description
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {application.jobId.description}
            </p>
          </div>
        )}

        {/* Resume Download */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Your Resume
          </h3>
          <button
            onClick={handleDownloadResume}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FiDownload />
            <span>Download My Resume</span>
          </button>
        </div>
      </main>
    </div>
  )
}

export default ApplicationDetailPage
