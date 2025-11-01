import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import { toast } from 'react-toastify'
import {
  FiLogOut,
  FiSave,
  FiUpload,
  FiDownload,
  FiX,
} from 'react-icons/fi'
import api from '../../services/api'

const CandidateProfile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeFileName, setResumeFileName] = useState('')
  const [resumeUploading, setResumeUploading] = useState(false)

  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    skills: [],
    experience: 0,
    education: '',
    linkedinUrl: '',
    portfolioUrl: '',
    bio: '',
  })

  const [validationErrors, setValidationErrors] = useState({})
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/candidates/profile')
      if (response.data.success && response.data.data.profile) {
        const profile = response.data.data.profile
        setFormData({
          phone: profile.phone || '',
          location: profile.location || '',
          skills: profile.skills || [],
          experience: profile.experience || 0,
          education: profile.education || '',
          linkedinUrl: profile.linkedinUrl || '',
          portfolioUrl: profile.portfolioUrl || '',
          bio: profile.bio || '',
        })
        if (profile.currentResumeFileId) {
          // Fetch resume metadata
          try {
            const resumeResp = await api.get('/candidates/profile/resume')
            if (resumeResp.data.success) {
              setResumeFileName(resumeResp.data.data.filename)
            }
          } catch (err) {
            console.error('Error fetching resume:', err)
          }
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
      setLoading(false)
    }
  }

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

    if (formData.phone && !/^[0-9\-\+\(\)\s]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    if (formData.linkedinUrl && !/^https?:\/\/.+/.test(formData.linkedinUrl)) {
      errors.linkedinUrl = 'Please enter a valid URL'
    }

    if (formData.portfolioUrl && !/^https?:\/\/.+/.test(formData.portfolioUrl)) {
      errors.portfolioUrl = 'Please enter a valid URL'
    }

    if (formData.experience < 0) {
      errors.experience = 'Experience cannot be negative'
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix validation errors')
      return
    }

    setSaving(true)
    try {
      const response = await api.put('/candidates/profile', formData)
      if (response.data.success) {
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        toast.error('Only PDF and DOCX files are allowed')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setResumeFile(file)
    }
  }

  const handleUploadResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a file first')
      return
    }

    setResumeUploading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('resume', resumeFile)

      const response = await api.post('/candidates/profile/resume', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setResumeFileName(response.data.data.filename)
        setResumeFile(null)
        toast.success('Resume uploaded successfully')
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume')
    } finally {
      setResumeUploading(false)
    }
  }

  const handleDownloadResume = async () => {
    try {
      const response = await api.get('/candidates/resume/download', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', resumeFileName || 'resume.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume')
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
          <p className="mt-4 text-gray-600">Loading profile...</p>
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
                Candidate Profile
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
        <div className="space-y-6">
          {/* Profile Form */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Profile Information
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.fullName || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    max="70"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      validationErrors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.experience && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="e.g., Bachelor's in Computer Science"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      validationErrors.linkedinUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.linkedinUrl && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.linkedinUrl}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      validationErrors.portfolioUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.portfolioUrl && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.portfolioUrl}</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
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
                <div className="flex flex-wrap gap-2">
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
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio <span className="text-xs text-gray-500">({formData.bio.length}/500 characters)</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  maxLength="500"
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    validationErrors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.bio && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.bio}</p>
                )}
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiSave />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Resume Section */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Resume Management
            </h2>

            {resumeFileName && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">Current Resume:</span> {resumeFileName}
                </p>
                <button
                  onClick={handleDownloadResume}
                  className="btn btn-secondary flex items-center space-x-2 mt-3 text-sm"
                >
                  <FiDownload />
                  <span>Download Resume</span>
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Resume
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleResumeChange}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: PDF, DOCX (Max size: 5MB)
                  </p>
                </div>
              </div>

              {resumeFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    Selected: <span className="font-semibold">{resumeFile.name}</span>
                  </p>
                </div>
              )}

              <button
                onClick={handleUploadResume}
                disabled={resumeUploading || !resumeFile}
                className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <FiUpload />
                <span>{resumeUploading ? 'Uploading...' : 'Upload Resume'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CandidateProfile
