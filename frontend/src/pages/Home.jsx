import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">JobMetric</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/jobs"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Jobs
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Find Your Perfect Match
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            JobMetric uses advanced NLP technology to automatically score resumes against job descriptions,
            providing intelligent matching for both recruiters and candidates.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
            >
              Get Started
            </Link>
            <Link
              to="/jobs"
              className="bg-white text-primary px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary hover:bg-blue-50 transition"
            >
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              AI-powered resume scoring using TF-IDF, BM25, and Cosine Similarity algorithms
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-success text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Ranked Results</h3>
            <p className="text-gray-600">
              Recruiters see candidates ranked by match score for efficient hiring
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-warning text-3xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-2">Actionable Feedback</h3>
            <p className="text-gray-600">
              Candidates receive detailed feedback on skills and areas for improvement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
