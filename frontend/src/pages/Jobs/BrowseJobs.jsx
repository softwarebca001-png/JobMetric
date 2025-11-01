import { Link } from 'react-router-dom';

function BrowseJobs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">JobMetric</h1>
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Browse Jobs</h2>
          <p className="mt-2 text-gray-600">
            Find your perfect job match with AI-powered resume scoring
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {/* Placeholder job cards */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Senior Full-Stack Developer
                </h3>
                <p className="text-gray-600 mt-1">Tech Corp • Remote</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    JavaScript
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    React
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Node.js
                  </span>
                </div>
                <p className="text-gray-700 mt-3 line-clamp-2">
                  We're looking for an experienced full-stack developer to join our growing team...
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Posted 2 days ago</div>
                <div className="text-lg font-semibold text-primary mt-1">
                  $100k - $150k
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/login"
                className="text-primary hover:text-blue-600 font-medium"
              >
                Login to Apply →
              </Link>
            </div>
          </div>

          {/* Empty state message */}
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-gray-400 text-5xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              More Jobs Coming Soon
            </h3>
            <p className="text-gray-600">
              The job portal is ready! Recruiters can start posting jobs after signing up.
            </p>
            <Link
              to="/register"
              className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowseJobs;
