# JobMetric - Job Portal with Automatic Resume Scoring System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application with an integrated NLP-based resume scoring engine. The system automatically evaluates resumes against job descriptions using TF-IDF, Cosine Similarity, and BM25 algorithms.

## 🎯 Features

### For Recruiters
- Post and manage job listings with detailed requirements
- View ranked candidate lists sorted by AI-generated match scores
- Review detailed application analytics including skill matching
- Manage application status (reviewed, shortlisted, rejected)
- Company profile management

### For Candidates
- Browse and search jobs with advanced filtering
- Apply with resume upload (PDF/DOCX supported)
- Instant match scores (0-100%) for each application
- Detailed feedback on matched and missing skills
- Profile and resume management
- Track application status in real-time

### NLP Scoring Engine
The system uses **4 sophisticated algorithms** to evaluate resumes:

1. **TF-IDF** - Measures term importance
2. **BM25** - Probabilistic ranking function
3. **Cosine Similarity** - Semantic similarity
4. **Keyword Matching** - Direct skill extraction

**Final Score** = Weighted average (25% each) → 0-100 match percentage

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Configure .env file
npm run dev  # Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
# Configure .env file
npm run dev  # Runs on http://localhost:5173
```

## 📊 Technology Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose + GridFS
- JWT Authentication
- Natural.js (NLP)
- wink-bm25-text-search
- pdf-parse + mammoth
- Nodemailer

### Frontend
- React 18 + Vite
- Redux Toolkit
- Tailwind CSS
- React Router v6
- Axios
- React Hook Form + Yup

## 📁 Project Structure

```
JobMetric/
├── backend/                # Node.js/Express API
│   ├── config/            # DB, GridFS, JWT config
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth, upload, error
│   ├── services/          # Email, file, scoring
│   ├── utils/scoring/     # NLP algorithms
│   └── server.js
│
└── frontend/              # React application
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── features/      # Redux slices
    │   ├── services/      # API service
    │   └── store.js
    └── tailwind.config.js
```

## 🔐 Security Features

- JWT Authentication (7-day tokens)
- Bcrypt password hashing
- Email verification required
- Role-based access control
- File type/size validation
- Secure file download authorization

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

### Jobs
- `GET /api/jobs` - List jobs (public)
- `POST /api/jobs` - Create job (recruiter)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Close job

### Applications
- `POST /api/applications` - Apply with resume
- `GET /api/applications/candidate/my-applications` - View applications
- `GET /api/applications/job/:jobId` - View ranked candidates
- `PATCH /api/applications/:id/status` - Update status

## 🧠 How NLP Scoring Works

1. **Resume uploaded** → PDF/DOCX text extracted
2. **Preprocessing** → Tokenization, stop word removal, stemming
3. **Four algorithms run in parallel:**
   - TF-IDF: Term frequency analysis
   - BM25: Probabilistic ranking
   - Cosine: Vector similarity
   - Keywords: Skill matching
4. **Scores normalized** to 0-100
5. **Feedback generated** based on score ranges
6. **Results returned** instantly

## ✅ Implementation Status

### Completed
✅ Full backend API with NLP scoring
✅ MongoDB models and GridFS storage
✅ Authentication system with email verification
✅ Resume parsing (PDF/DOCX)
✅ All 4 NLP algorithms
✅ Frontend setup with Redux
✅ Core pages (Home, Login, Register, Browse Jobs)
✅ Tailwind CSS styling

### To Be Implemented
🚧 Dashboard pages (candidate/recruiter)
🚧 Profile management UI
🚧 Job posting/editing UI
🚧 Application review UI
🚧 Protected routes component

## 🧪 Testing the System

1. Register as recruiter and candidate
2. Verify emails
3. Post a job (as recruiter)
4. Upload resume and apply (as candidate)
5. View ranked applications with scores (as recruiter)

## 📧 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobmetric
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=JobMetric
```

## 📝 License

Educational project for MERN stack learning.

---

**Built with React, Node.js, MongoDB, and NLP Magic ✨**
