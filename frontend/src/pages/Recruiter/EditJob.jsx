import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import { toast } from 'react-toastify'
import {
  FiLogOut,
  FiSave,
  FiX,
  FiArrowLeft,
} from 'react-icons/fi'
import api from '../../services/api'

const EditJobPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skills: [],
    location: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    minSalary: '',
    maxSalary: '',
  })

  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`)
      if (response.data.success) {
        const job = response.data.data.job
        setFormData({
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          skills: job.skills,
          location: job.location,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          minSalary: job.minSalary ? job.minSalary.toString() : '',
          maxSalary: job.maxSalary ? job.maxSalary.toString() : '',
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching job:', error)
      toast.error('Failed to load job details')
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      if (formData.skills.includes(skillInput.trim())) {
        toast.warning('Skill already added')
        return
      }
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Job title is required'
    }

    if (!formData.description.trim()) {
      errors.description = 'Job description is required'
    }

    if (!formData.requirements.trim()) {
      errors.requirements = 'Requirements are required'
    }

    if (formData.skills.length === 0) {
      errors.skills = 'At least one skill is required'
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required'
    }

    if (formData.minSalary && formData.maxSalary) {
      const min = parseInt(formData.minSalary)
      const max = parseInt(formData.maxSalary)
      if (min > max) {
        errors.salary = 'Minimum salary cannot be greater than maximum salary'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleUpdateJob = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix validation errors')
      return
    }

    setSaving(true)
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        skills: formData.skills,
        location: formData.location,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
      }

      if (formData.minSalary) {
        jobData.minSalary = parseInt(formData.minSalary)
      }
      if (formData.maxSalary) {
        jobData.maxSalary = parseInt(formData.maxSalary)
      }

      const response = await api.patch(`/jobs/${id}`, jobData)
      if (response.data.success) {
        toast.success('Job updated successfully!')
        navigate(`/recruiter/jobs/${id}`)
      }
    } catch (error) {
      console.error('Error updating job:', error)
      toast.error('Failed to update job')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading job...</p>
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
                Edit Job
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
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="flex items-center text-primary hover:text-blue-600 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to My Jobs
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Job
          </h2>
          <p className="text-gray-600">
            Update the job details
          </p>
        </div>

        <form onSubmit={handleUpdateJob} className="space-y-6">
          {/* Title */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                validationErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                validationErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500 mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* Requirements */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements <span className="text-red-500">*</span>
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows="6"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                validationErrors.requirements ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.requirements && (
              <p className="text-sm text-red-500 mt-1">
                {validationErrors.requirements}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                placeholder="Enter a skill and press Enter"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-primary px-4"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill) => (
                <div
                  key={skill}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
            {validationErrors.skills && (
              <p className="text-sm text-red-500">{validationErrors.skills}</p>
            )}
          </div>

          {/* Location & Job Details */}
          <div className="card">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    validationErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.location && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Salary Range (Optional)
            </label>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="minSalary"
                  value={formData.minSalary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="maxSalary"
                  value={formData.maxSalary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {validationErrors.salary && (
              <p className="text-sm text-red-500 mt-2">{validationErrors.salary}</p>
            )}
          </div>

          {/* Actions */}
          <div className="card flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <FiSave />
              <span>{saving ? 'Updating...' : 'Update Job'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/recruiter/jobs')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default EditJobPage
