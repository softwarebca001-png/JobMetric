import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import {
  FiLogOut,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import api from '../../services/api'
import { toast } from 'react-toastify'

const AdminUsers = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, candidate, recruiter
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [filter, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `/admin/users?role=${filter === 'all' ? '' : filter}&page=${currentPage}&limit=${usersPerPage}`
      )
      setUsers(response.data.data.users)
      setTotalPages(response.data.data.pagination.pages)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      // Mock data for demonstration
      const mockUsers = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'candidate',
          isVerified: true,
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@company.com',
          role: 'recruiter',
          isVerified: true,
          createdAt: '2024-01-20T14:20:00Z',
        },
        {
          _id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'candidate',
          isVerified: false,
          createdAt: '2024-02-05T09:15:00Z',
        },
        {
          _id: '4',
          name: 'Alice Williams',
          email: 'alice@company.com',
          role: 'recruiter',
          isVerified: false,
          createdAt: '2024-02-10T11:45:00Z',
        },
        {
          _id: '5',
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          role: 'candidate',
          isVerified: true,
          createdAt: '2024-02-15T16:30:00Z',
        },
      ]

      const filteredUsers =
        filter === 'all'
          ? mockUsers
          : mockUsers.filter((u) => u.role === filter)

      setUsers(filteredUsers)
      setTotalPages(1)
      setLoading(false)
    }
  }

  const handleVerifyToggle = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`, {
        isVerified: !currentStatus,
      })
      toast.success(
        `User ${currentStatus ? 'unverified' : 'verified'} successfully`
      )
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update verification status')
      console.error('Error updating verification:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
      console.error('Error deleting user:', error)
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
                  className="text-primary-600 font-semibold px-3 py-2 rounded-md"
                >
                  Users
                </Link>
                <Link
                  to="/admin/jobs"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
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
            User Management
          </h2>
          <p className="text-gray-600">
            Manage users, verify accounts, and control access
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium text-gray-700">Filter by Role:</span>
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
              All Users
            </button>
            <button
              onClick={() => {
                setFilter('candidate')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'candidate'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Candidates
            </button>
            <button
              onClick={() => {
                setFilter('recruiter')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'recruiter'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Recruiters
            </button>
            <div className="ml-auto text-sm text-gray-600">
              {users.length} user{users.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">
                                {userItem.fullName?.charAt(0).toUpperCase() || userItem.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userItem.fullName || userItem.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {userItem.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`badge ${
                              userItem.role === 'candidate'
                                ? 'badge-info'
                                : 'badge-primary'
                            }`}
                          >
                            {userItem.role.charAt(0).toUpperCase() +
                              userItem.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`badge ${
                              userItem.isVerified
                                ? 'badge-success'
                                : 'badge-warning'
                            }`}
                          >
                            {userItem.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(userItem.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() =>
                                handleVerifyToggle(
                                  userItem._id,
                                  userItem.isVerified
                                )
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                userItem.isVerified
                                  ? 'text-yellow-600 hover:bg-yellow-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={
                                userItem.isVerified ? 'Unverify' : 'Verify'
                              }
                            >
                              {userItem.isVerified ? (
                                <FiXCircle className="text-xl" />
                              ) : (
                                <FiCheckCircle className="text-xl" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem._id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete User"
                            >
                              <FiTrash2 className="text-xl" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
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
        </div>
      </main>
    </div>
  )
}

export default AdminUsers
