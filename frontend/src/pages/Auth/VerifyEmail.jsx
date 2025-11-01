import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi'
import api from '../../services/api'

const VerifyEmail = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`)

      if (response.data.success) {
        setStatus('success')
        setMessage(response.data.message || 'Email verified successfully!')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(response.data.message || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage(
        error.response?.data?.message ||
        'Invalid or expired verification token. Please try registering again.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">JobMetric</h1>
          <p className="text-gray-600">Email Verification</p>
        </div>

        <div className="card text-center py-12">
          {status === 'verifying' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <FiLoader className="text-4xl text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <FiCheckCircle className="text-4xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to login page in 3 seconds...
              </p>
              <Link
                to="/login"
                className="btn btn-primary inline-block"
              >
                Go to Login Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <FiXCircle className="text-4xl text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  to="/register"
                  className="btn btn-primary block"
                >
                  Register Again
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary block"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Need help? Contact support at support@jobmetric.com
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail
