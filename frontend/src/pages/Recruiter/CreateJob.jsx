import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import { toast } from 'react-toastify'
import {
  FiLogOut,
  FiSave,
  FiX,
  FiEye,
} from 'react-icons/fi'
import api from '../../services/api'

const CreateJobPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
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
    } else if (formData.title.length < 3) {
      errors.title = 'Job title must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      errors.description = 'Job description is required'
    } else if (formData.description.length < 20) {
      errors.description = 'Description must be at least 20 characters'
    }

    if (!formData.requirements.trim()) {
      errors.requirements = 'Requirements are required'
    } else if (formData.requirements.length < 20) {
      errors.requirements = 'Requirements must be at least 20 characters'
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

  const handlePostJob = async (e) => {
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

      const response = await api.post('/jobs', jobData)
      if (response.data.success) {
        toast.success('Job posted successfully!')
        navigate(`/recruiter/jobs/${response.data.data.job._id}`)
      }
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error('Failed to post job')
    } finally {
      setSaving(false)
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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">JobMetric</h1>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700 font-medium">
                Post New Job
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Post a New Job
          </h2>
          <p className="text-gray-600">
            Fill in the details below to create your job posting
          </p>
        </div>

        <form onSubmit={handlePostJob} className="space-y-6">
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
              placeholder="e.g., Senior Frontend Developer"
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
              <span className="text-xs text-gray-500 ml-2">
                ({formData.description.length}/500 characters recommended)
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the job role, responsibilities, and what you're looking for..."
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
              <span className="text-xs text-gray-500 ml-2">
                ({formData.requirements.length}/500 characters recommended)
              </span>
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="List the required qualifications, experience, and skills..."
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
                  placeholder="e.g., New York, NY or Remote"
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
                  placeholder="e.g., 50000"
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
                  placeholder="e.g., 100000"
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
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FiEye />
              <span>Preview</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <FiSave />
              <span>{saving ? 'Posting...' : 'Post Job'}</span>
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

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Job Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {formData.title}
                  </h2>
                  <p className="text-gray-600 mt-2">{user?.companyName || 'Company'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">{formData.location}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Job Type</h4>
                    <p className="text-gray-600">
                      {formData.jobType.charAt(0).toUpperCase() + formData.jobType.slice(1)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Experience Level
                    </h4>
                    <p className="text-gray-600">
                      {formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {formData.requirements}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {(formData.minSalary || formData.maxSalary) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Salary Range
                    </h3>
                    <p className="text-gray-600">
                      {formData.minSalary && `$${parseInt(formData.minSalary).toLocaleString()}`}
                      {formData.minSalary && formData.maxSalary && ' - '}
                      {formData.maxSalary && `$${parseInt(formData.maxSalary).toLocaleString()}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CreateJobPage
