import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import { toast } from 'react-toastify'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  const validateEmail = () => {
    if (!email) {
      setValidationError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address')
      return false
    }
    setValidationError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateEmail()) {
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', { email })
      if (response.data.success) {
        setSubmitted(true)
        toast.success('Password reset link sent to your email!')
      } else {
        setError(response.data.message || 'Failed to send reset link')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    setValidationError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              JobMetric
            </h1>
            <p className="text-gray-600">
              Reset your password
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Forgot Password
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="text-sm text-gray-600 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleChange}
                    required
                    className={`input pl-10 ${validationError ? 'border-red-500' : ''}`}
                    placeholder="you@example.com"
                  />
                </div>
                {validationError && (
                  <p className="text-red-500 text-xs mt-1">{validationError}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              {/* Back to Login */}
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <FiArrowLeft className="mr-1" />
                Back to Login
              </Link>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
                <p className="font-medium mb-2">Reset link sent!</p>
                <p className="text-sm">
                  Check your email for a link to reset your password. The link will expire in 1 hour.
                </p>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Didn't receive an email? Check your spam folder or try again.
              </p>

              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <FiArrowLeft className="mr-1" />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
