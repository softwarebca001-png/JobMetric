# JobMetric - Job Portal with Automatic Resume Scoring System
## Implementation Plan

## Overview
Building a full-stack MERN (MongoDB, Express.js, React.js, Node.js) job portal with an integrated NLP-based resume scoring engine. The system will automatically evaluate resumes against job descriptions using TF-IDF, Cosine Similarity, and BM25 algorithms, providing recruiters with ranked candidate lists and candidates with match feedback.

## Repository
**Repo:** JobMetric (single repository, MERN monorepo structure)

## Current State Analysis
- Greenfield project with initialized Git repository
- Contains only README.md and .gitignore
- No existing code, dependencies, or architecture
- Ready for complete implementation from scratch

## Architecture Overview
**Architecture:** MERN Stack Monorepo with NLP-based Resume Scoring

**Components:**
1. **Backend (Node.js + Express)**: RESTful API handling authentication, jobs, applications, and resume scoring
2. **Frontend (React + Vite)**: Single-page application with role-based routing
3. **Database (MongoDB)**: Document storage with GridFS for file management
4. **NLP Engine**: Integrated scoring system using natural, wink-bm25-text-search, and keyword-extractor libraries
5. **Email Service**: Nodemailer for verification and password reset emails

**Data Flow:**
- Candidate uploads resume → Backend stores in GridFS → Extract text → Apply to job → Run NLP scoring → Return ranked result
- Recruiter views applications → Backend queries Applications sorted by score → Return ranked candidate list

## Authentication & User Management

### Authentication Strategy
**Method:** JWT (JSON Web Tokens) - stateless, scalable authentication

### User Types
1. **Recruiters** - Can post jobs, view applications, access ranked candidate lists
2. **Candidates** - Can apply to jobs, upload resumes, view match scores and feedback

### JWT Implementation
- **Token Generation:** On successful login (after email verification)
- **Token Storage:** localStorage on frontend (accessible to JavaScript for Authorization header)
- **Token Expiration:** 7 days (604800 seconds)
- **Token Payload:** `{ userId, email, role }` where role is 'recruiter' or 'candidate'
- **JWT Secret:** Stored in backend environment variable (never exposed)
- **Password Hashing:** bcrypt with 10 salt rounds

### Password Validation Criteria
- **Minimum length:** 8 characters
- **Must contain:** At least one letter AND at least one number
- **Recommended:** Mix of uppercase, lowercase, numbers, and special characters
- **Frontend validation:** Show password strength indicator
- **Backend validation:** Enforce minimum requirements (don't trust frontend)

### Registration/Login Flow
**Registration:**
- Separate registration forms for recruiters and candidates
- Required fields: Email, password, full name, role (recruiter/candidate)
- Additional field for recruiters: Company name
- Email verification required before account activation
- Verification token: Random 32-byte hex string, expires in 24 hours
- Verification email sent to provided email address (using emailService)

**Login:**
- Email + password authentication
- Returns JWT token on successful login
- Only verified accounts can log in (must verify email first)
- Invalid credentials return 401 error
- Token valid for 7 days from login

**Password Reset:**
- Request reset link via email
- Reset token: Random 32-byte hex string, expires in 1 hour
- Email contains link: FRONTEND_URL/reset-password/:token
- New password must meet validation criteria (min 8 chars, letter + number)
- After reset: Old tokens remain valid (user should re-login with new password)

## Database Schema

### MongoDB Collections

#### 1. Users Collection
**Purpose:** Core authentication and user management for both recruiters and candidates

**Fields:**
- `_id` (ObjectId, auto-generated)
- `email` (String, unique, required, lowercase, trimmed)
- `password` (String, required, bcrypt hashed)
- `fullName` (String, required)
- `role` (String, enum: ['recruiter', 'candidate'], required)
- `isVerified` (Boolean, default: false)
- `verificationToken` (String, nullable)
- `verificationTokenExpires` (Date, nullable)
- `resetPasswordToken` (String, nullable)
- `resetPasswordExpires` (Date, nullable)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-updated)

**Indexes:**
- Unique index on `email`
- Index on `verificationToken`
- Index on `resetPasswordToken`
- Index on `role`

#### 2. CandidateProfiles Collection
**Purpose:** Detailed candidate information and current resume

**Fields:**
- `_id` (ObjectId, auto-generated)
- `userId` (ObjectId, reference to Users._id, unique, required)
- `phone` (String, optional)
- `location` (String, optional)
- `currentResumeFileId` (ObjectId, reference to GridFS file, nullable)
- `currentResumeText` (String, extracted text from latest resume, used for quick access)
- `skills` (Array of Strings, extracted from resume or manually added)
- `experience` (Number, years of experience, optional)
- `education` (String, highest education level, optional)
- `linkedinUrl` (String, optional)
- `portfolioUrl` (String, optional)
- `bio` (String, max 500 chars, optional)
- `updatedAt` (Date, auto-updated)

**Indexes:**
- Unique index on `userId`
- Index on `skills` (for skill-based searches)

#### 3. RecruiterProfiles Collection
**Purpose:** Detailed recruiter and company information

**Fields:**
- `_id` (ObjectId, auto-generated)
- `userId` (ObjectId, reference to Users._id, unique, required)
- `companyName` (String, required)
- `companyDescription` (String, optional)
- `companyWebsite` (String, optional)
- `companyLogo` (String, URL or file path, optional)
- `phone` (String, optional)
- `location` (String, optional)
- `updatedAt` (Date, auto-updated)

**Indexes:**
- Unique index on `userId`

#### 4. Jobs Collection
**Purpose:** Job postings created by recruiters

**Fields:**
- `_id` (ObjectId, auto-generated)
- `recruiterId` (ObjectId, reference to Users._id, required)
- `title` (String, required)
- `description` (String, required, full job description)
- `requirements` (String, required, detailed requirements used for NLP scoring)
- `requiredSkills` (Array of Strings, required, minimum 1 skill)
- `location` (String, required)
- `jobType` (String, enum: ['full-time', 'part-time', 'contract', 'internship'], required)
- `experienceLevel` (String, enum: ['entry', 'mid', 'senior', 'lead'], required)
- `salaryMin` (Number, optional)
- `salaryMax` (Number, optional)
- `status` (String, enum: ['open', 'closed'], default: 'open')
- `applicationCount` (Number, default: 0)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-updated)
- `closedAt` (Date, nullable)

**Indexes:**
- Index on `recruiterId`
- Index on `status`
- Compound index on `status` and `createdAt` (for listing open jobs)
- Text index on `title`, `description`, and `requirements` (for search)

#### 5. Applications Collection
**Purpose:** Job applications with resume scoring data

**Fields:**
- `_id` (ObjectId, auto-generated)
- `jobId` (ObjectId, reference to Jobs._id, required)
- `candidateId` (ObjectId, reference to Users._id, required)
- `resumeFileId` (ObjectId, reference to GridFS file, required)
- `resumeText` (String, extracted text from uploaded resume, required)
- `status` (String, enum: ['applied', 'reviewed', 'shortlisted', 'rejected'], default: 'applied')
- `scores` (Object):
  - `tfidfScore` (Number, 0-1 range)
  - `bm25Score` (Number, raw BM25 score)
  - `keywordMatchScore` (Number, 0-100 percentage)
  - `cosineScore` (Number, 0-1 range from cosine similarity)
  - `finalScore` (Number, 0-100 weighted average, used for ranking)
- `matchPercentage` (Number, 0-100, user-friendly score display)
- `matchedSkills` (Array of Strings, skills from job found in resume)
- `missingSkills` (Array of Strings, required skills not found in resume)
- `keywordsMatched` (Array of Strings, important keywords found)
- `feedback` (String, auto-generated feedback text for candidate)
- `appliedAt` (Date, auto-generated)
- `updatedAt` (Date, auto-updated)
- `reviewedAt` (Date, nullable, when recruiter reviews)

**Indexes:**
- Index on `jobId`
- Index on `candidateId`
- Compound unique index on `jobId` and `candidateId` (prevent duplicate applications)
- Compound index on `jobId` and `scores.finalScore` (for ranked retrieval)
- Index on `status`

#### 6. GridFS Collections (MongoDB GridFS for file storage)
**Purpose:** Store resume files (PDF, DOC, DOCX)

**Collections (auto-managed by GridFS):**
- `fs.files` - File metadata
- `fs.chunks` - File content chunks (255KB each)

**Metadata stored in fs.files:**
- `_id` (ObjectId, file identifier)
- `filename` (String, original filename)
- `contentType` (String, MIME type)
- `length` (Number, file size in bytes)
- `uploadDate` (Date)
- `metadata` (Object):
  - `uploadedBy` (ObjectId, user who uploaded)
  - `purpose` (String, 'profile' or 'application')
  - `relatedId` (ObjectId, related profile or application ID)

### Relationships
- Users (1) → CandidateProfiles (1)
- Users (1) → RecruiterProfiles (1)
- Users/Recruiters (1) → Jobs (N)
- Jobs (1) → Applications (N)
- Users/Candidates (1) → Applications (N)
- CandidateProfiles (1) → GridFS files (1 current resume)
- Applications (1) → GridFS files (1 per application)

## Resume Upload & Parsing System

### File Upload Specifications
**Accepted Formats:** PDF (.pdf) and DOCX (.docx) only
**Maximum File Size:** 5MB per file
**Storage:** MongoDB GridFS

### Upload Flow
1. Client selects resume file (PDF or DOCX)
2. Frontend validates file type and size before upload
3. File uploaded to backend via multipart/form-data
4. Backend validates file again (MIME type and size)
5. File stored in GridFS with metadata
6. Text extraction triggered automatically
7. Extracted text stored in database for quick access
8. Return file ID and success status to client

### Text Extraction Libraries & Process

**Libraries to use:**
- `multer` - Handle multipart/form-data file uploads
- `multer-gridfs-storage` - Direct upload to GridFS
- `pdf-parse` - Extract text from PDF files
- `mammoth` - Extract text from DOCX files

**Extraction Process:**
1. Retrieve file from GridFS by file ID
2. Detect file type from MIME type or extension
3. For PDF: Use pdf-parse to extract text
4. For DOCX: Use mammoth.extractRawText() to extract text
5. Clean extracted text:
   - Remove extra whitespace and newlines
   - Normalize to UTF-8 encoding
   - Remove special characters that interfere with NLP
   - Convert to lowercase for NLP processing (store original case separately if needed)
6. Store extracted text in Applications.resumeText or CandidateProfiles.currentResumeText

### Validation Rules
**File Type Validation:**
- Check MIME type: `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Check file extension: .pdf or .docx
- Reject if mismatch or unsupported format
- Error: "Only PDF and DOCX files are allowed"

**File Size Validation:**
- Maximum 5MB (5,242,880 bytes)
- Reject if exceeds limit
- Error: "File size must be under 5MB"

**Content Validation:**
- After extraction, check if text is not empty
- Minimum 50 characters of extracted text required
- If empty or too short: Error "Could not extract text from resume. Please ensure file is readable."

### Error Handling
**Upload Errors:**
- File too large → 400 "File size must be under 5MB"
- Invalid file type → 400 "Only PDF and DOCX files are allowed"
- No file provided → 400 "Resume file is required"
- GridFS storage failure → 500 "Failed to upload file. Please try again."

**Parsing Errors:**
- PDF parsing failure → 500 "Failed to read PDF. File may be corrupted."
- DOCX parsing failure → 500 "Failed to read DOCX. File may be corrupted."
- Empty content → 400 "Could not extract text from resume. Please ensure file is readable."
- Encryption detected → 400 "Password-protected files are not supported."

### Upload Contexts

**Context 1: Profile Resume Upload**
- Endpoint: POST /api/candidates/profile/resume
- Updates CandidateProfiles.currentResumeFileId and currentResumeText
- Overwrites previous resume (old file remains in GridFS for history)
- Available only to candidates

**Context 2: Job Application Resume Upload**
- Endpoint: POST /api/applications (with resume file)
- Creates new Application record
- Stores file ID in Applications.resumeFileId
- Stores extracted text in Applications.resumeText
- Triggers automatic NLP scoring
- Each application can have different resume

## Backend API Specification

### API Base URL
**Development:** http://localhost:5000/api
**Structure:** RESTful API with JSON request/response bodies

### Authentication Middleware
**JWT Verification:**
- Middleware function: `verifyToken`
- Reads JWT from `Authorization` header: `Bearer <token>`
- Verifies token signature and expiration
- Attaches decoded user info to `req.user` object
- Returns 401 if token missing, invalid, or expired

**Role-Based Access:**
- Middleware function: `requireRole(role)`
- Checks `req.user.role` matches required role
- Returns 403 if role doesn't match

### Error Response Format
All errors follow consistent format:
```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Detailed error 1", "Detailed error 2"] // Optional array for validation errors
}
```

### Success Response Format
All successful responses follow:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

---

## API Endpoints

### 1. Authentication Routes (Base: /api/auth)

#### POST /api/auth/register
**Purpose:** Register new user (recruiter or candidate)

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "fullName": "string (required, min 2 chars)",
  "role": "string (required, 'recruiter' or 'candidate')",
  "companyName": "string (required if role=recruiter)"
}
```

**Validation:**
- Email: Valid format, unique in database
- Password: Minimum 8 characters, must contain letter and number
- Full name: Minimum 2 characters
- Role: Must be 'recruiter' or 'candidate'
- Company name: Required if role is recruiter

**Process:**
1. Validate request body
2. Check if email already exists (return 400 if exists)
3. Hash password with bcrypt (10 salt rounds)
4. Generate verification token (random 32-byte hex string)
5. Set verification token expiry (24 hours from now)
6. Create User document
7. If candidate: Create empty CandidateProfile document
8. If recruiter: Create RecruiterProfile with companyName
9. Send verification email (to be implemented with email service)
10. Return success (do not return token yet - must verify email first)

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "ObjectId string",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "candidate"
  }
}
```

**Errors:**
- 400: Email already exists, invalid input, validation failures
- 500: Database error, email sending failure (still creates user)

---

#### POST /api/auth/login
**Purpose:** Authenticate user and return JWT token

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Process:**
1. Find user by email
2. Return 401 if user not found: "Invalid email or password"
3. Check if user.isVerified is true
4. Return 401 if not verified: "Please verify your email before logging in"
5. Compare password with bcrypt
6. Return 401 if password incorrect: "Invalid email or password"
7. Generate JWT token with payload: { userId, email, role }
8. JWT expiration: 7 days
9. Return token and user data

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "JWT token string",
    "user": {
      "id": "ObjectId string",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "candidate",
      "isVerified": true
    }
  }
}
```

**Errors:**
- 401: Invalid credentials, email not verified
- 400: Missing fields

---

#### GET /api/auth/verify-email/:token
**Purpose:** Verify user email address

**Access:** Public

**URL Parameter:** `token` - verification token from email

**Process:**
1. Find user with matching verificationToken
2. Return 400 if no user found: "Invalid or expired verification token"
3. Check if verificationTokenExpires > current time
4. Return 400 if expired: "Verification token has expired. Please request a new one."
5. Set user.isVerified = true
6. Clear verificationToken and verificationTokenExpires
7. Save user
8. Return success

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

**Errors:**
- 400: Invalid or expired token
- 500: Database error

---

#### POST /api/auth/forgot-password
**Purpose:** Request password reset link

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Process:**
1. Find user by email
2. If user not found: Still return success (security - don't reveal if email exists)
3. Generate reset token (random 32-byte hex string)
4. Set resetPasswordExpires (1 hour from now)
5. Save user with reset token
6. Send password reset email with link: /reset-password/:token
7. Return success

**Response (200):**
```json
{
  "success": true,
  "message": "If that email exists, a password reset link has been sent."
}
```

**Errors:**
- 500: Database or email service error

---

#### POST /api/auth/reset-password
**Purpose:** Reset password using token

**Access:** Public

**Request Body:**
```json
{
  "token": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

**Validation:**
- New password: Minimum 8 characters, must contain letter and number

**Process:**
1. Find user with matching resetPasswordToken
2. Return 400 if no user: "Invalid or expired reset token"
3. Check if resetPasswordExpires > current time
4. Return 400 if expired: "Reset token has expired. Please request a new one."
5. Hash new password with bcrypt
6. Update user.password
7. Clear resetPasswordToken and resetPasswordExpires
8. Save user
9. Return success

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now log in with your new password."
}
```

**Errors:**
- 400: Invalid/expired token, weak password
- 500: Database error

---

#### GET /api/auth/me
**Purpose:** Get current logged-in user's data

**Access:** Protected (requires JWT)

**Headers:** `Authorization: Bearer <token>`

**Process:**
1. Verify JWT token (middleware)
2. Get user ID from token
3. Find user in database
4. Return user data without password

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ObjectId",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "candidate",
    "isVerified": true,
    "createdAt": "ISO date"
  }
}
```

**Errors:**
- 401: Invalid or missing token
- 404: User not found

---

### 2. Candidate Profile Routes (Base: /api/candidates)

#### GET /api/candidates/profile
**Purpose:** Get current candidate's profile

**Access:** Protected (candidates only)

**Headers:** `Authorization: Bearer <token>`

**Process:**
1. Verify token and role = candidate
2. Find CandidateProfile by userId
3. Return profile data

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "ObjectId",
    "phone": "123-456-7890",
    "location": "New York, NY",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": 3,
    "education": "Bachelor's in Computer Science",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "portfolioUrl": "https://johndoe.com",
    "bio": "Full-stack developer...",
    "currentResumeFileId": "ObjectId or null"
  }
}
```

**Errors:**
- 401: Not authenticated
- 403: Not a candidate
- 404: Profile not found

---

#### PUT /api/candidates/profile
**Purpose:** Update candidate profile

**Access:** Protected (candidates only)

**Request Body:** (all fields optional)
```json
{
  "phone": "string",
  "location": "string",
  "skills": ["array", "of", "strings"],
  "experience": "number",
  "education": "string",
  "linkedinUrl": "string (valid URL)",
  "portfolioUrl": "string (valid URL)",
  "bio": "string (max 500 chars)"
}
```

**Validation:**
- Bio: Maximum 500 characters
- LinkedIn URL: Valid URL format if provided
- Portfolio URL: Valid URL format if provided
- Skills: Array of strings if provided
- Experience: Non-negative number if provided

**Process:**
1. Verify token and role
2. Validate input
3. Update CandidateProfile with provided fields
4. Return updated profile

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated profile */ }
}
```

**Errors:**
- 400: Validation errors
- 401/403: Authentication/authorization errors

---

#### POST /api/candidates/profile/resume
**Purpose:** Upload or update profile resume

**Access:** Protected (candidates only)

**Content-Type:** multipart/form-data

**Form Data:**
- `resume`: File (PDF or DOCX, max 5MB)

**Process:**
1. Verify token and role
2. Validate file (type, size) using multer
3. Upload to GridFS with metadata
4. Extract text from file (pdf-parse or mammoth)
5. Update CandidateProfile:
   - Set currentResumeFileId
   - Set currentResumeText
6. Return success with file ID

**Response (200):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "fileId": "ObjectId",
    "filename": "resume.pdf"
  }
}
```

**Errors:**
- 400: Invalid file type, file too large, parsing error
- 401/403: Authentication errors
- 500: Upload or parsing failure

---

#### GET /api/candidates/profile/resume
**Purpose:** Download current profile resume

**Access:** Protected (candidates only)

**Process:**
1. Verify token and role
2. Get currentResumeFileId from CandidateProfile
3. Return 404 if no resume uploaded
4. Stream file from GridFS
5. Set appropriate headers (Content-Type, Content-Disposition)

**Response:** File download stream

**Errors:**
- 404: No resume found
- 401/403: Authentication errors

---

### 3. Recruiter Profile Routes (Base: /api/recruiters)

#### GET /api/recruiters/profile
**Purpose:** Get current recruiter's profile

**Access:** Protected (recruiters only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "ObjectId",
    "companyName": "Tech Corp",
    "companyDescription": "Leading tech company...",
    "companyWebsite": "https://techcorp.com",
    "companyLogo": "URL or null",
    "phone": "123-456-7890",
    "location": "San Francisco, CA"
  }
}
```

---

#### PUT /api/recruiters/profile
**Purpose:** Update recruiter profile

**Access:** Protected (recruiters only)

**Request Body:** (all optional except companyName)
```json
{
  "companyName": "string (required)",
  "companyDescription": "string",
  "companyWebsite": "string (valid URL)",
  "companyLogo": "string",
  "phone": "string",
  "location": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated profile */ }
}
```

---

### 4. Jobs Routes (Base: /api/jobs)

#### POST /api/jobs
**Purpose:** Create new job posting

**Access:** Protected (recruiters only)

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "requirements": "string (required)",
  "requiredSkills": ["array", "of", "strings"] (required, min 1),
  "location": "string (required)",
  "jobType": "string (required, enum)",
  "experienceLevel": "string (required, enum)",
  "salaryMin": "number (optional)",
  "salaryMax": "number (optional)"
}
```

**Validation:**
- Title: Required, min 5 chars
- Description: Required, min 50 chars
- Requirements: Required, min 50 chars
- Required skills: Array with at least 1 skill
- Job type: Must be one of: full-time, part-time, contract, internship
- Experience level: Must be one of: entry, mid, senior, lead
- Salary: If both provided, salaryMax must be >= salaryMin

**Process:**
1. Verify token and role = recruiter
2. Validate all fields
3. Create Job document with recruiterId from token
4. Set status = 'open', applicationCount = 0
5. Return created job

**Response (201):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "data": {
    "id": "ObjectId",
    "title": "Senior Full-Stack Developer",
    "description": "...",
    "requirements": "...",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "location": "Remote",
    "jobType": "full-time",
    "experienceLevel": "senior",
    "salaryMin": 100000,
    "salaryMax": 150000,
    "status": "open",
    "applicationCount": 0,
    "createdAt": "ISO date"
  }
}
```

**Errors:**
- 400: Validation errors
- 401/403: Authentication errors

---

#### GET /api/jobs
**Purpose:** List all open jobs (with pagination and filtering)

**Access:** Public

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10, max: 50)
- `search`: string (search in title, description)
- `location`: string (filter by location)
- `jobType`: string (filter by job type)
- `experienceLevel`: string (filter by experience level)
- `skills`: comma-separated skills to match

**Process:**
1. Build query filter for status = 'open'
2. Add filters if provided (location, jobType, etc.)
3. If search provided: Use text index search
4. If skills provided: Match jobs with those requiredSkills
5. Sort by createdAt descending
6. Paginate results
7. Return jobs with pagination metadata

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      { /* job object */ },
      { /* job object */ }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalJobs": 47,
      "limit": 10
    }
  }
}
```

**Errors:**
- 400: Invalid query parameters

---

#### GET /api/jobs/:id
**Purpose:** Get single job details

**Access:** Public

**Process:**
1. Find job by ID
2. Populate recruiter info (name, company)
3. Return 404 if not found
4. Return job details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ObjectId",
    "title": "Senior Full-Stack Developer",
    "description": "...",
    "requirements": "...",
    "requiredSkills": ["JavaScript", "React"],
    "location": "Remote",
    "jobType": "full-time",
    "experienceLevel": "senior",
    "salaryMin": 100000,
    "salaryMax": 150000,
    "status": "open",
    "applicationCount": 12,
    "recruiter": {
      "fullName": "Jane Smith",
      "companyName": "Tech Corp"
    },
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Errors:**
- 404: Job not found
- 400: Invalid job ID format

---

#### PUT /api/jobs/:id
**Purpose:** Update job posting

**Access:** Protected (recruiter who created the job only)

**Request Body:** Same as POST /api/jobs (all fields optional for update)

**Process:**
1. Verify token and role = recruiter
2. Find job by ID
3. Return 404 if not found
4. Check if recruiterId matches token userId
5. Return 403 if not owner
6. Validate and update provided fields
7. Set updatedAt timestamp
8. Return updated job

**Response (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": { /* updated job */ }
}
```

**Errors:**
- 403: Not the job owner
- 404: Job not found
- 400: Validation errors

---

#### DELETE /api/jobs/:id
**Purpose:** Close/delete job posting

**Access:** Protected (recruiter who created the job only)

**Process:**
1. Verify token and ownership
2. Set job status = 'closed'
3. Set closedAt timestamp
4. Return success
(Note: Soft delete - keeps job and applications in database)

**Response (200):**
```json
{
  "success": true,
  "message": "Job closed successfully"
}
```

**Errors:**
- 403: Not the job owner
- 404: Job not found

---

#### GET /api/jobs/recruiter/my-jobs
**Purpose:** Get all jobs posted by current recruiter

**Access:** Protected (recruiters only)

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `status`: 'open' or 'closed' (optional filter)

**Process:**
1. Verify token and role
2. Find all jobs where recruiterId = current user
3. Filter by status if provided
4. Sort by createdAt descending
5. Paginate and return

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      { /* job with applicationCount */ }
    ],
    "pagination": { /* pagination metadata */ }
  }
}
```

---

### 5. Applications Routes (Base: /api/applications)

#### POST /api/applications
**Purpose:** Apply to a job with resume

**Access:** Protected (candidates only)

**Content-Type:** multipart/form-data

**Form Data:**
- `jobId`: ObjectId string (required)
- `resume`: File (PDF or DOCX, max 5MB, required)

**Process:**
1. Verify token and role = candidate
2. Validate jobId and check job exists and is open
3. Check if candidate already applied (unique index on jobId + candidateId)
4. Return 400 if duplicate application
5. Validate and upload resume file to GridFS
6. Extract text from resume
7. Create Application document with extracted text
8. **Trigger NLP scoring immediately:**
   - Get job description and requirements
   - Run scoring algorithms
   - Calculate all scores
   - Generate feedback
   - Update Application with scores
9. Increment job.applicationCount
10. Return application with scores

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "ObjectId",
    "jobId": "ObjectId",
    "jobTitle": "Senior Developer",
    "status": "applied",
    "matchPercentage": 75,
    "scores": {
      "tfidfScore": 0.72,
      "bm25Score": 7.5,
      "cosineScore": 0.78,
      "keywordMatchScore": 70,
      "finalScore": 75
    },
    "matchedSkills": ["JavaScript", "React"],
    "missingSkills": ["MongoDB", "Docker"],
    "feedback": "Good match. Your resume shows...",
    "appliedAt": "ISO date"
  }
}
```

**Errors:**
- 400: Job not found, job closed, duplicate application, invalid file
- 401/403: Authentication errors
- 500: Upload, parsing, or scoring errors

---

#### GET /api/applications/candidate/my-applications
**Purpose:** Get all applications by current candidate

**Access:** Protected (candidates only)

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `status`: filter by application status (optional)

**Process:**
1. Verify token and role
2. Find all applications where candidateId = current user
3. Populate job details (title, company, location)
4. Sort by appliedAt descending
5. Paginate and return

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "ObjectId",
        "job": {
          "id": "ObjectId",
          "title": "Senior Developer",
          "companyName": "Tech Corp",
          "location": "Remote"
        },
        "status": "applied",
        "matchPercentage": 75,
        "appliedAt": "ISO date"
      }
    ],
    "pagination": { /* metadata */ }
  }
}
```

---

#### GET /api/applications/job/:jobId
**Purpose:** Get all applications for a specific job (recruiter only)

**Access:** Protected (recruiter who owns the job)

**Query Parameters:**
- `page`: number
- `limit`: number
- `sortBy`: 'score' (default) or 'date'
- `status`: filter by application status

**Process:**
1. Verify token and role = recruiter
2. Find job by jobId
3. Return 404 if job not found
4. Check if recruiterId matches current user
5. Return 403 if not owner
6. Find all applications for this job
7. Populate candidate info (name, email, profile data)
8. Sort by finalScore descending (or appliedAt if sortBy=date)
9. Paginate and return ranked list

**Response (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "ObjectId",
      "title": "Senior Developer"
    },
    "applications": [
      {
        "id": "ObjectId",
        "candidate": {
          "id": "ObjectId",
          "fullName": "John Doe",
          "email": "john@example.com",
          "phone": "123-456-7890",
          "location": "New York",
          "skills": ["JavaScript", "React"]
        },
        "matchPercentage": 85,
        "scores": { /* all scores */ },
        "matchedSkills": ["JavaScript", "React"],
        "missingSkills": ["Docker"],
        "status": "applied",
        "appliedAt": "ISO date"
      }
    ],
    "pagination": { /* metadata */ }
  }
}
```

**Errors:**
- 403: Not the job owner
- 404: Job not found

---

#### GET /api/applications/:id
**Purpose:** Get single application details

**Access:** Protected (candidate who applied OR recruiter who owns the job)

**Process:**
1. Verify token
2. Find application by ID
3. Populate job and candidate details
4. Check authorization:
   - If candidate: candidateId must match token userId
   - If recruiter: job.recruiterId must match token userId
5. Return 403 if not authorized
6. Return full application details including resume download link

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ObjectId",
    "job": { /* job details */ },
    "candidate": { /* candidate details (if recruiter viewing) */ },
    "resumeFileId": "ObjectId",
    "resumeDownloadUrl": "/api/files/:fileId",
    "status": "applied",
    "scores": { /* all scores */ },
    "matchPercentage": 75,
    "matchedSkills": ["JavaScript"],
    "missingSkills": ["Docker"],
    "feedback": "Good match...",
    "appliedAt": "ISO date",
    "reviewedAt": "ISO date or null"
  }
}
```

**Errors:**
- 403: Not authorized to view
- 404: Application not found

---

#### PATCH /api/applications/:id/status
**Purpose:** Update application status (recruiter only)

**Access:** Protected (recruiter who owns the job)

**Request Body:**
```json
{
  "status": "string (required, enum: reviewed, shortlisted, rejected)"
}
```

**Process:**
1. Verify token and role = recruiter
2. Find application and populate job
3. Check if recruiter owns the job
4. Return 403 if not owner
5. Validate status value
6. Update application status
7. Set reviewedAt timestamp if status changes to 'reviewed'
8. Return updated application

**Response (200):**
```json
{
  "success": true,
  "message": "Application status updated",
  "data": {
    "id": "ObjectId",
    "status": "shortlisted",
    "reviewedAt": "ISO date"
  }
}
```

**Errors:**
- 403: Not the job owner
- 404: Application not found
- 400: Invalid status value

---

### 6. File Routes (Base: /api/files)

#### GET /api/files/:fileId
**Purpose:** Download resume file from GridFS

**Access:** Protected (owner or authorized recruiter only)

**Process:**
1. Verify token
2. Find file in GridFS by fileId
3. Return 404 if not found
4. Check authorization:
   - Get metadata.relatedId (application or profile ID)
   - If from application: Check if candidate owns or recruiter owns job
   - If from profile: Check if candidate owns profile
5. Return 403 if not authorized
6. Stream file with appropriate headers:
   - Content-Type from file metadata
   - Content-Disposition: attachment; filename="originalname"
7. Stream file chunks to response

**Response:** Binary file stream

**Errors:**
- 403: Not authorized to download
- 404: File not found
- 401: Not authenticated

---

## Middleware Summary

**Files to create:**
- `middleware/auth.js`:
  - `verifyToken(req, res, next)` - Verify JWT and attach user to req
  - `requireRole(role)` - Check user has specific role

**Usage Examples:**
```javascript
// Candidate-only route
router.get('/profile', verifyToken, requireRole('candidate'), getProfile)

// Recruiter-only route
router.post('/jobs', verifyToken, requireRole('recruiter'), createJob)

// Any authenticated user
router.get('/me', verifyToken, getCurrentUser)
```

---

## Request Validation

**Library:** `express-validator` for input validation

**Validation Middleware:**
- Create reusable validation chains for common fields
- Validation functions in `validators/` directory
- Each route has specific validation middleware

**Example Validators:**
- `validators/auth.js` - Register, login validation
- `validators/jobs.js` - Job creation/update validation
- `validators/applications.js` - Application validation

---

## File Upload Configuration

**Library:** `multer` with `multer-gridfs-storage`

**Configuration:**
```javascript
const storage = new GridFsStorage({
  url: MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'fs',
      filename: `${Date.now()}-${file.originalname}`,
      metadata: {
        uploadedBy: req.user.userId,
        purpose: req.body.purpose || 'application',
        relatedId: req.body.relatedId || null
      }
    }
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and DOCX files allowed'), false)
    }
  }
})
```

## Resume Scoring Engine (NLP-Based)

### Overview
Automatic resume evaluation using four NLP algorithms: TF-IDF, BM25, Cosine Similarity, and Keyword Matching. Each algorithm contributes equally (25%) to the final score.

### NPM Libraries Required
- `natural` - NLP toolkit for tokenization, stemming, TF-IDF
- `wink-bm25-text-search` - BM25 ranking algorithm
- `keyword-extractor` - Extract important keywords from text
- `stopword` - Remove common stop words

### Text Preprocessing Pipeline

**Input:** Raw text from resume and job description
**Output:** Cleaned, tokenized text ready for NLP algorithms

**Steps:**
1. **Lowercase conversion** - Convert all text to lowercase
2. **Remove special characters** - Keep only alphanumeric and spaces
3. **Tokenization** - Split text into individual words (use natural.WordTokenizer)
4. **Stop word removal** - Remove common words (use stopword library with English stop words)
5. **Stemming** - Reduce words to root form using Porter Stemmer (natural.PorterStemmer)
6. **Remove extra whitespace** - Trim and normalize spacing

**Preprocessing applied to:**
- Job description + requirements text (combined)
- Resume text
- Skills lists (separate, simpler preprocessing without stop word removal)

### Scoring Algorithms

#### Algorithm 1: TF-IDF (Term Frequency-Inverse Document Frequency)
**Purpose:** Measure importance of terms in resume relative to job description

**Implementation:**
- Use natural.TfIdf class
- Add job description as document 1
- Add resume text as document 2
- For each important term in job description:
  - Calculate TF-IDF score in resume
  - Sum scores for all important job terms found in resume
- Normalize to 0-1 range by dividing by maximum possible score
- Store as `scores.tfidfScore` (0-1 decimal)

**Normalization for final score:**
- Multiply by 100 to get 0-100 scale
- This becomes 25% of final score

#### Algorithm 2: BM25 (Best Matching 25)
**Purpose:** Rank resume relevance using probabilistic ranking

**Implementation:**
- Use wink-bm25-text-search library
- Create BM25 index with job description as the document corpus
- Query: Preprocessed resume text
- BM25 returns raw score (typically 0-10 range, but can vary)
- Store raw BM25 score as `scores.bm25Score`

**Normalization for final score:**
- Normalize BM25 score to 0-100 scale
- Method: Use sigmoid function or cap at reasonable maximum (e.g., 10)
- Formula: normalized = min(100, (bm25Score / 10) * 100)
- This becomes 25% of final score

#### Algorithm 3: Cosine Similarity
**Purpose:** Measure semantic similarity between resume and job description

**Implementation:**
- Convert job description to vector (word frequency vector)
- Convert resume to vector (word frequency vector)
- Calculate cosine similarity between vectors
- Formula: cosine = (A · B) / (||A|| * ||B||)
- Result is 0-1 where 1 is perfect match
- Store as `scores.cosineScore` (0-1 decimal)

**Implementation using natural library:**
- Use natural.TfIdf to get term vectors
- Calculate dot product and magnitudes
- Compute cosine similarity

**Normalization for final score:**
- Multiply by 100 to get 0-100 scale
- This becomes 25% of final score

#### Algorithm 4: Keyword Matching
**Purpose:** Direct matching of important skills and keywords

**Implementation:**
- Extract keywords from job description using keyword-extractor
  - Extract top 20 keywords from job requirements
  - Include all requiredSkills from job
- Search for each keyword in preprocessed resume
- Count matches (case-insensitive, stemmed matching)
- Calculate percentage: (matched keywords / total keywords) * 100
- Store as `scores.keywordMatchScore` (0-100 percentage)

**Skill-specific matching:**
- Separately check each skill in job.requiredSkills
- If found in resume: Add to `matchedSkills` array
- If not found: Add to `missingSkills` array
- Skills matching is exact match after preprocessing

**Normalization for final score:**
- Already in 0-100 scale
- This becomes 25% of final score

### Final Score Calculation

**Formula:**
```
finalScore = (tfidfScore * 100 * 0.25) +
             (normalizedBM25 * 0.25) +
             (cosineScore * 100 * 0.25) +
             (keywordMatchScore * 0.25)
```

**Result:** 0-100 score stored in `scores.finalScore`

**Match Percentage:** Same as final score, stored in `matchPercentage` for user-friendly display

### Feedback Generation

**Purpose:** Provide actionable feedback to candidates about their application

**Feedback Structure:**
Generated text stored in `feedback` field, includes:

1. **Overall match statement**
   - 80-100: "Excellent match! Your resume strongly aligns with this position."
   - 60-79: "Good match. Your resume shows relevant experience for this role."
   - 40-59: "Moderate match. Some of your skills align with this position."
   - 0-39: "Limited match. Consider highlighting more relevant experience."

2. **Matched skills highlight**
   - "Your resume matches these required skills: [list matchedSkills]"
   - Only if matchedSkills array has items

3. **Missing skills notification**
   - "Consider adding or highlighting these skills: [list missingSkills]"
   - Only if missingSkills array has items
   - Maximum 5 skills listed to avoid overwhelming

4. **Improvement suggestions** (based on score ranges)
   - If keywordMatchScore < 50: "Try to include more keywords from the job description."
   - If matchedSkills.length < 3: "Emphasize technical skills that match the job requirements."
   - If overall score < 60: "Consider tailoring your resume to better match this specific role."

**Feedback Template Example:**
```
"Good match. Your resume shows relevant experience for this role. Your resume matches these required skills: JavaScript, React, Node.js. Consider adding or highlighting these skills: MongoDB, Express.js. Try to include more keywords from the job description."
```

### Scoring Trigger & Flow

**When scoring happens:**
- Automatically triggered when new application is submitted
- Runs synchronously during application creation (before response sent)
- If scoring fails, application still created but with null scores

**Scoring Flow:**
1. Application created with resume text and file ID
2. Retrieve job description and requirements from Jobs collection
3. Preprocess both resume text and job text
4. Run all 4 algorithms in parallel (async operations)
5. Calculate individual scores
6. Compute final score
7. Identify matched and missing skills
8. Generate feedback text
9. Update Application document with all scores and feedback
10. Return success to client

**Error Handling:**
- If any algorithm fails: Log error, use 0 for that score component
- If all algorithms fail: Set all scores to null, feedback to "Unable to calculate match score"
- Application creation succeeds regardless of scoring success

### Re-scoring Capability
**Future consideration:** Allow recruiters to trigger re-scoring if job description is updated
**Not in initial implementation:** Batch re-scoring of existing applications

### Performance Considerations
- Preprocessing text once and caching if needed
- BM25 index creation is lightweight for single job document
- All algorithms run in <1 second for typical resume/job pair
- No external API calls required (all processing local)

## Frontend Application

### Technology Stack
- **Framework:** React.js 18+
- **Build Tool:** Vite (fast development and build)
- **Routing:** React Router v6
- **State Management:** Redux Toolkit with RTK Query for API calls
- **Styling:** Tailwind CSS
- **Form Handling:** React Hook Form
- **Validation:** Yup (schema validation)
- **HTTP Client:** Axios (for non-RTK Query calls)
- **Icons:** React Icons (or Heroicons)
- **Notifications:** React Toastify
- **File Upload:** react-dropzone for drag-and-drop

### Application Structure

**Repository location:** `JobMetric/frontend/`

**Key directories:**
```
frontend/
├── public/
├── src/
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── features/          # Redux slices
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── layouts/           # Layout components
│   ├── routes/            # Route configuration
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
└── package.json
```

---

## Routing & Pages

### Public Routes (No authentication required)

#### 1. Home Page (`/`)
**Component:** `pages/Home.jsx`
**Purpose:** Landing page with system overview and CTA

**Content:**
- Hero section explaining the job portal
- Features highlight (for recruiters and candidates)
- Call-to-action buttons: "Post a Job" and "Find Jobs"
- Brief explanation of automatic resume scoring
- Navigation to login/register

---

#### 2. Login Page (`/login`)
**Component:** `pages/Auth/Login.jsx`
**Purpose:** User login (both recruiters and candidates)

**Features:**
- Email and password fields
- Remember me checkbox (optional)
- Login button
- Link to "Forgot Password"
- Link to "Register" page
- Form validation with error messages
- On success: Redirect to role-specific dashboard

**Redux Actions:**
- Dispatch `login` thunk from `features/auth/authSlice.js`
- Store token and user data in Redux store
- Save token to localStorage

---

#### 3. Register Page (`/register`)
**Component:** `pages/Auth/Register.jsx`
**Purpose:** User registration with role selection

**Features:**
- Role selection: Radio buttons for "Recruiter" or "Candidate"
- Common fields: Email, password, full name
- Conditional field: Company name (shows if recruiter selected)
- Password strength indicator
- Terms & conditions checkbox
- Register button
- Link to "Login" page
- Form validation

**Process:**
- On submit: POST to `/api/auth/register`
- Show success message: "Registration successful! Check your email to verify."
- Redirect to login page after 3 seconds

---

#### 4. Email Verification Page (`/verify-email/:token`)
**Component:** `pages/Auth/VerifyEmail.jsx`
**Purpose:** Verify email from link

**Features:**
- Auto-triggers verification API call on mount
- Loading spinner during verification
- Success message: "Email verified! Redirecting to login..."
- Error message if token invalid/expired
- Link to resend verification email (future feature)
- Auto-redirect to login on success after 3 seconds

---

#### 5. Forgot Password Page (`/forgot-password`)
**Component:** `pages/Auth/ForgotPassword.jsx`
**Purpose:** Request password reset link

**Features:**
- Email input field
- Submit button
- Success message displayed inline
- Link back to login
- Rate limiting notice (to prevent spam)

---

#### 6. Reset Password Page (`/reset-password/:token`)
**Component:** `pages/Auth/ResetPassword.jsx`
**Purpose:** Set new password using reset token

**Features:**
- New password field
- Confirm password field
- Password strength indicator
- Submit button
- Token validation on mount
- Success: Redirect to login
- Error handling for expired/invalid tokens

---

#### 7. Browse Jobs Page (`/jobs`)
**Component:** `pages/Jobs/BrowseJobs.jsx`
**Purpose:** Public job listing (anyone can view)

**Features:**
- List of all open jobs
- Search bar (searches title and description)
- Filters:
  - Location dropdown/input
  - Job type checkboxes (full-time, part-time, etc.)
  - Experience level checkboxes
  - Skills filter (comma-separated input)
- Pagination (10 jobs per page)
- Job cards showing:
  - Title
  - Company name
  - Location
  - Job type badge
  - Experience level badge
  - Salary range (if available)
  - Required skills tags (first 5)
  - "View Details" button
- Sort options: Newest first, Oldest first
- No application button (requires login)

**Redux:**
- Use RTK Query endpoint for `/api/jobs`
- Cache results
- Handle loading and error states

---

#### 8. Job Details Page (`/jobs/:id`)
**Component:** `pages/Jobs/JobDetail.jsx`
**Purpose:** View single job details

**Features:**
- Full job information:
  - Title
  - Company info (name, website if available)
  - Description (formatted with line breaks)
  - Requirements (formatted)
  - All required skills as tags
  - Location
  - Job type and experience level badges
  - Salary range
  - Posted date
  - Application count
- If not logged in: "Login to Apply" button → redirects to login
- If logged in as candidate: "Apply Now" button → opens application modal
- If logged in as recruiter and owner: "Edit Job" and "Close Job" buttons
- If logged in as recruiter but not owner: No action buttons

---

### Protected Routes - Candidate Role

**Layout:** `layouts/CandidateLayout.jsx` (includes navigation sidebar/header)

#### 9. Candidate Dashboard (`/candidate/dashboard`)
**Component:** `pages/Candidate/Dashboard.jsx`
**Purpose:** Overview of candidate's applications and profile

**Features:**
- Welcome message with candidate name
- Stats cards:
  - Total applications submitted
  - Applications in review
  - Shortlisted applications
  - Rejected applications
- Quick actions:
  - "Browse Jobs" button
  - "Update Profile" button
  - "Update Resume" button
- Recent applications list (5 most recent):
  - Job title and company
  - Match percentage with color indicator
  - Status badge
  - Applied date
  - "View Details" link
- Profile completeness indicator (percentage bar)
  - Shows what's missing (resume, skills, etc.)

---

#### 10. Candidate Profile Page (`/candidate/profile`)
**Component:** `pages/Candidate/Profile.jsx`
**Purpose:** View and edit candidate profile

**Features:**
- Profile information display/edit form:
  - Full name (from Users, display only)
  - Email (display only)
  - Phone (editable)
  - Location (editable)
  - Skills (multi-select/tag input, editable)
  - Years of experience (number input)
  - Education (text input)
  - LinkedIn URL (editable)
  - Portfolio URL (editable)
  - Bio (textarea, 500 char limit)
- Current resume section:
  - Shows file name if uploaded
  - "Download Resume" button
  - "Upload New Resume" button (opens file picker)
  - Drag-and-drop zone for resume upload
  - Accepted formats: PDF, DOCX (displayed)
  - Max size: 5MB (displayed)
- "Save Changes" button (for profile fields)
- Form validation
- Success/error notifications via toast

**Redux:**
- Load profile data on mount
- Update profile action
- Upload resume action

---

#### 11. My Applications Page (`/candidate/applications`)
**Component:** `pages/Candidate/Applications.jsx`
**Purpose:** List all applications submitted by candidate

**Features:**
- Filter tabs:
  - All
  - Applied
  - Reviewed
  - Shortlisted
  - Rejected
- Application cards showing:
  - Job title and company
  - Applied date
  - Status badge (color-coded)
  - Match percentage with circular progress indicator
  - "View Details" button
- Pagination
- Empty state if no applications: "You haven't applied to any jobs yet" with "Browse Jobs" button

---

#### 12. Application Details Page (`/candidate/applications/:id`)
**Component:** `pages/Candidate/ApplicationDetail.jsx`
**Purpose:** Detailed view of single application

**Features:**
- Job information section:
  - Title, company, location
  - Full description
  - Required skills
  - "View Full Job" link
- Application status timeline (visual progress):
  - Applied → Reviewed → Shortlisted/Rejected
  - Highlight current status
- Match score section:
  - Large circular percentage display
  - Score breakdown (expandable):
    - TF-IDF score
    - BM25 score
    - Cosine similarity score
    - Keyword match score
  - Visual bars for each score component
- Matched skills section:
  - Green checkmark with each matched skill
- Missing skills section:
  - Red X with each missing skill
  - Suggestion: "Consider highlighting these skills in your resume"
- Feedback section:
  - Display generated feedback text
  - Formatted nicely with icons
- Resume section:
  - File name
  - "Download My Resume" button
- Applied date and reviewed date (if applicable)

---

### Protected Routes - Recruiter Role

**Layout:** `layouts/RecruiterLayout.jsx` (includes navigation sidebar/header)

#### 13. Recruiter Dashboard (`/recruiter/dashboard`)
**Component:** `pages/Recruiter/Dashboard.jsx`
**Purpose:** Overview of recruiter's jobs and applications

**Features:**
- Welcome message with recruiter name and company
- Stats cards:
  - Total jobs posted
  - Open jobs
  - Closed jobs
  - Total applications received
- Quick actions:
  - "Post New Job" button → redirects to create job page
  - "View All Jobs" button
- Recent jobs list (5 most recent):
  - Job title
  - Posted date
  - Status badge (open/closed)
  - Application count
  - "View Applications" button
- Recent applications list (5 most recent across all jobs):
  - Candidate name
  - Job applied to
  - Match percentage
  - Applied date
  - "View Details" button

---

#### 14. Post Job Page (`/recruiter/jobs/new`)
**Component:** `pages/Recruiter/CreateJob.jsx`
**Purpose:** Create new job posting

**Features:**
- Form fields:
  - Title (text input, required)
  - Description (rich text area or large textarea, required)
  - Requirements (rich text area or large textarea, required)
  - Required skills (tag input, required, min 1 skill)
  - Location (text input, required)
  - Job type (dropdown: full-time, part-time, contract, internship)
  - Experience level (dropdown: entry, mid, senior, lead)
  - Salary range (optional):
    - Min salary (number input)
    - Max salary (number input)
- "Preview" button (shows preview modal)
- "Post Job" button
- "Cancel" button
- Form validation with inline errors
- Character counters for description/requirements
- Auto-save to localStorage (draft recovery)

**On Success:**
- Show success toast
- Redirect to job details page or "My Jobs"

---

#### 15. My Jobs Page (`/recruiter/jobs`)
**Component:** `pages/Recruiter/MyJobs.jsx`
**Purpose:** List all jobs posted by recruiter

**Features:**
- Filter tabs:
  - All
  - Open
  - Closed
- Job cards showing:
  - Title
  - Status badge
  - Posted date
  - Application count (clickable)
  - Action buttons:
    - "View Applications"
    - "Edit Job"
    - "Close Job" (if open) or "Reopen Job" (if closed)
- Pagination
- Empty state: "You haven't posted any jobs yet" with "Post Job" button

---

#### 16. Edit Job Page (`/recruiter/jobs/:id/edit`)
**Component:** `pages/Recruiter/EditJob.jsx`
**Purpose:** Edit existing job posting

**Features:**
- Same form as Create Job, pre-filled with existing data
- "Update Job" button instead of "Post Job"
- "Cancel" button returns to job details
- Can only edit if job belongs to logged-in recruiter
- 403 error page if trying to edit someone else's job

---

#### 17. Job Applications Page (`/recruiter/jobs/:jobId/applications`)
**Component:** `pages/Recruiter/JobApplications.jsx`
**Purpose:** View all applications for a specific job (RANKED LIST)

**Features:**
- Job info header:
  - Job title
  - Posted date
  - Total applications count
  - "View Job Details" link
- Sort options:
  - By Score (default - highest first)
  - By Date (newest first)
- Filter by status:
  - All
  - Applied
  - Reviewed
  - Shortlisted
  - Rejected
- Application cards/table rows showing:
  - Rank number (1, 2, 3...)
  - Candidate name
  - Match percentage with color-coded badge:
    - 80-100: Green
    - 60-79: Yellow
    - 40-59: Orange
    - 0-39: Red
  - Matched skills count / total required skills
  - Applied date
  - Status dropdown (change status inline):
    - Applied
    - Reviewed
    - Shortlisted
    - Rejected
  - "View Details" button
- Pagination or infinite scroll
- Export to CSV button (all applications)
- Empty state: "No applications yet"

---

#### 18. Application Review Page (`/recruiter/applications/:id`)
**Component:** `pages/Recruiter/ApplicationReview.jsx`
**Purpose:** Detailed view of candidate application (recruiter perspective)

**Features:**
- Candidate information:
  - Full name
  - Email
  - Phone
  - Location
  - Skills (all candidate skills, highlight matches)
  - Experience years
  - Education
  - LinkedIn and portfolio links (if available)
- Match analysis section:
  - Large match percentage display
  - Score breakdown (all four algorithm scores)
  - Visual representation (bars/charts)
- Skills analysis:
  - Matched skills (green checkmarks)
  - Missing skills (highlighted)
- Resume section:
  - File name and upload date
  - "Download Resume" button (PDF/DOCX download)
  - Resume preview (if possible) or "View in new tab"
- Job context:
  - Job title and description
  - "View Full Job" link
- Application timeline:
  - Applied date
  - Reviewed date (if applicable)
  - Status updates history
- Status action:
  - Current status badge
  - "Change Status" dropdown:
    - Mark as Reviewed
    - Shortlist Candidate
    - Reject Application
  - Confirmation for reject action
- Notes section (future enhancement - not in initial implementation)
- "Back to Applications" button

---

#### 19. Recruiter Profile Page (`/recruiter/profile`)
**Component:** `pages/Recruiter/Profile.jsx`
**Purpose:** View and edit recruiter/company profile

**Features:**
- Profile form:
  - Full name (display only, from Users)
  - Email (display only)
  - Company name (editable, required)
  - Company description (textarea, optional)
  - Company website (URL input, optional)
  - Company logo URL (text input or upload - text for initial implementation)
  - Phone (editable)
  - Location (editable)
- "Save Changes" button
- Form validation
- Success/error toasts

---

### Shared Components

#### Navigation Components

**CandidateNavigation** (`components/Navigation/CandidateNav.jsx`)
- Sidebar or top nav with links:
  - Dashboard
  - Browse Jobs
  - My Applications
  - Profile
  - Logout
- Active route highlighting
- User avatar and name display

**RecruiterNavigation** (`components/Navigation/RecruiterNav.jsx`)
- Sidebar or top nav with links:
  - Dashboard
  - My Jobs
  - Post New Job
  - Profile
  - Logout
- Active route highlighting
- Company logo and recruiter name display

---

#### UI Components

**JobCard** (`components/Job/JobCard.jsx`)
- Displays job summary
- Props: job object, showActions (boolean)
- Used in: BrowseJobs, CandidateDashboard, MyJobs

**ApplicationCard** (`components/Application/ApplicationCard.jsx`)
- Displays application summary with match score
- Props: application object, viewMode ('candidate' | 'recruiter')
- Visual match percentage indicator
- Status badge

**MatchScoreDisplay** (`components/Application/MatchScoreDisplay.jsx`)
- Circular progress indicator for match percentage
- Color-coded (green/yellow/orange/red)
- Props: score (0-100)

**SkillTag** (`components/Common/SkillTag.jsx`)
- Displays skill as colored tag
- Props: skill (string), matched (boolean)
- Visual distinction for matched vs missing skills

**StatusBadge** (`components/Common/StatusBadge.jsx`)
- Colored badge for status display
- Props: status (string), type ('job' | 'application')
- Color mapping:
  - open/applied: blue
  - reviewed: yellow
  - shortlisted: green
  - rejected: red
  - closed: gray

**FileUploadZone** (`components/Common/FileUploadZone.jsx`)
- Drag-and-drop file upload with react-dropzone
- Props: accept (file types), maxSize, onUpload callback
- Visual feedback for drag over
- File validation and error display
- Progress indicator during upload

**ProtectedRoute** (`components/Route/ProtectedRoute.jsx`)
- Route wrapper for authentication check
- Props: allowedRole (optional)
- Redirects to login if not authenticated
- Shows 403 if wrong role
- Used to wrap all protected routes

**LoadingSpinner** (`components/Common/LoadingSpinner.jsx`)
- Reusable loading indicator
- Full-page or inline variants
- Props: fullPage (boolean)

**EmptyState** (`components/Common/EmptyState.jsx`)
- Display when list is empty
- Props: message, icon, actionButton (optional)
- Used in: Applications list, Jobs list

---

### Redux Store Structure

**Store configuration:** `src/store.js`

**Slices:**

#### 1. `features/auth/authSlice.js`
**State:**
```javascript
{
  user: null | { id, email, fullName, role, isVerified },
  token: null | string,
  isAuthenticated: false,
  loading: false,
  error: null
}
```

**Actions/Thunks:**
- `login(credentials)` - POST /api/auth/login
- `register(userData)` - POST /api/auth/register
- `logout()` - Clear state and localStorage
- `loadUserFromStorage()` - Check localStorage on app init
- `getCurrentUser()` - GET /api/auth/me (refresh user data)

---

#### 2. `features/jobs/jobsSlice.js`
**Using RTK Query** for API calls

**Endpoints:**
- `getJobs` - GET /api/jobs (with filters)
- `getJobById` - GET /api/jobs/:id
- `getMyJobs` - GET /api/jobs/recruiter/my-jobs
- `createJob` - POST /api/jobs
- `updateJob` - PUT /api/jobs/:id
- `deleteJob` - DELETE /api/jobs/:id

**Cache management:**
- Tag system for invalidation
- Auto-refetch on related mutations

---

#### 3. `features/applications/applicationsSlice.js`
**Using RTK Query**

**Endpoints:**
- `getMyApplications` - GET /api/applications/candidate/my-applications
- `getJobApplications` - GET /api/applications/job/:jobId
- `getApplicationById` - GET /api/applications/:id
- `createApplication` - POST /api/applications
- `updateApplicationStatus` - PATCH /api/applications/:id/status

---

#### 4. `features/profile/profileSlice.js`
**Using RTK Query**

**Endpoints:**
- `getCandidateProfile` - GET /api/candidates/profile
- `updateCandidateProfile` - PUT /api/candidates/profile
- `uploadResume` - POST /api/candidates/profile/resume
- `getRecruiterProfile` - GET /api/recruiters/profile
- `updateRecruiterProfile` - PUT /api/recruiters/profile

---

### Route Configuration

**File:** `src/routes/routes.jsx`

**Route structure with React Router:**
```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/verify-email/:token" element={<VerifyEmail />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
  <Route path="/jobs" element={<BrowseJobs />} />
  <Route path="/jobs/:id" element={<JobDetail />} />

  {/* Candidate Routes */}
  <Route element={<ProtectedRoute allowedRole="candidate" />}>
    <Route path="/candidate" element={<CandidateLayout />}>
      <Route path="dashboard" element={<CandidateDashboard />} />
      <Route path="profile" element={<CandidateProfile />} />
      <Route path="applications" element={<MyApplications />} />
      <Route path="applications/:id" element={<ApplicationDetail />} />
    </Route>
  </Route>

  {/* Recruiter Routes */}
  <Route element={<ProtectedRoute allowedRole="recruiter" />}>
    <Route path="/recruiter" element={<RecruiterLayout />}>
      <Route path="dashboard" element={<RecruiterDashboard />} />
      <Route path="profile" element={<RecruiterProfile />} />
      <Route path="jobs" element={<MyJobs />} />
      <Route path="jobs/new" element={<CreateJob />} />
      <Route path="jobs/:id/edit" element={<EditJob />} />
      <Route path="jobs/:jobId/applications" element={<JobApplications />} />
      <Route path="applications/:id" element={<ApplicationReview />} />
    </Route>
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

### Key Features Implementation Notes

#### Authentication Flow
1. User logs in → JWT stored in Redux state and localStorage
2. On app load: Check localStorage for token
3. If token exists: Verify with GET /api/auth/me
4. Set `isAuthenticated` and `user` in Redux
5. Protected routes check `isAuthenticated` and role
6. Token included in all API calls via Axios interceptor

#### File Upload with Progress
1. Use FormData for multipart/form-data
2. Axios onUploadProgress callback for progress tracking
3. Display progress bar during upload
4. Show success/error toast on completion

#### Real-time Form Validation
1. React Hook Form for form state
2. Yup schemas for validation rules
3. Inline error display below fields
4. Disabled submit button until valid

#### Responsive Design
1. Tailwind breakpoints: sm, md, lg, xl
2. Mobile-first approach
3. Sidebar collapses to hamburger menu on mobile
4. Tables convert to cards on mobile
5. Touch-friendly button sizes

#### Accessibility
1. Semantic HTML elements
2. ARIA labels where needed
3. Keyboard navigation support
4. Focus states for all interactive elements
5. Alt text for images
6. Color contrast compliance (WCAG AA)

---

### Environment Variables

**File:** `frontend/.env`

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=JobMetric
```

Usage in code: `import.meta.env.VITE_API_BASE_URL`

---

### API Service Configuration

**File:** `src/services/api.js`

**Axios instance setup:**
```javascript
import axios from 'axios'
import store from '../store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

### UI/UX Guidelines

**Color Scheme:**
- Primary: Blue (#3B82F6)
- Success/Match: Green (#10B981)
- Warning: Yellow/Orange (#F59E0B)
- Error/Reject: Red (#EF4444)
- Neutral: Gray shades

**Typography:**
- Headings: Font-bold, larger sizes
- Body: Font-normal, readable sizes (16px base)
- Code/numbers: Font-mono for scores

**Spacing:**
- Consistent padding and margins using Tailwind scale
- Cards: p-6 (24px padding)
- Sections: mb-8 (32px margin bottom)

**Interactive Elements:**
- Buttons: Rounded corners, hover effects, active states
- Links: Underline on hover, color change
- Forms: Clear focus states, error states

**Match Score Colors:**
- 80-100: text-green-600, bg-green-100
- 60-79: text-yellow-600, bg-yellow-100
- 40-59: text-orange-600, bg-orange-100
- 0-39: text-red-600, bg-red-100

## Project Structure

### Monorepo Organization
The JobMetric repository will be organized as a monorepo containing both backend and frontend.

```
JobMetric/
├── .gitignore
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── .env (not committed)
│   ├── server.js (entry point)
│   ├── config/
│   │   ├── db.js (MongoDB connection)
│   │   ├── jwt.js (JWT configuration)
│   │   └── gridfs.js (GridFS setup)
│   ├── models/
│   │   ├── User.js
│   │   ├── CandidateProfile.js
│   │   ├── RecruiterProfile.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js (authentication routes)
│   │   ├── candidates.js (candidate profile routes)
│   │   ├── recruiters.js (recruiter profile routes)
│   │   ├── jobs.js (job routes)
│   │   ├── applications.js (application routes)
│   │   └── files.js (file download routes)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   ├── recruiterController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   └── fileController.js
│   ├── middleware/
│   │   ├── auth.js (verifyToken, requireRole)
│   │   ├── upload.js (multer configuration)
│   │   └── errorHandler.js (global error handler)
│   ├── validators/
│   │   ├── auth.js (authentication validation)
│   │   ├── jobs.js (job validation)
│   │   ├── applications.js (application validation)
│   │   └── profiles.js (profile validation)
│   ├── services/
│   │   ├── emailService.js (send emails)
│   │   ├── fileService.js (GridFS operations)
│   │   ├── resumeParserService.js (extract text from PDF/DOCX)
│   │   └── scoringService.js (NLP resume scoring)
│   ├── utils/
│   │   ├── tokenGenerator.js (generate verification/reset tokens)
│   │   ├── validation.js (common validation functions)
│   │   └── scoring/
│   │       ├── preprocessor.js (text preprocessing)
│   │       ├── tfidf.js (TF-IDF implementation)
│   │       ├── bm25.js (BM25 implementation)
│   │       ├── cosine.js (Cosine similarity)
│   │       ├── keywordMatcher.js (Keyword matching)
│   │       └── feedbackGenerator.js (Generate feedback text)
│   └── tests/ (optional for initial implementation)
│       ├── auth.test.js
│       ├── jobs.test.js
│       └── scoring.test.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── .env (not committed)
│   ├── index.html
│   ├── public/
│   │   └── (static assets - logo, favicon)
│   └── src/
│       ├── main.jsx (entry point)
│       ├── App.jsx (root component with routing)
│       ├── index.css (Tailwind imports)
│       ├── store.js (Redux store configuration)
│       ├── components/
│       │   ├── Common/
│       │   │   ├── LoadingSpinner.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── StatusBadge.jsx
│       │   │   ├── SkillTag.jsx
│       │   │   └── FileUploadZone.jsx
│       │   ├── Navigation/
│       │   │   ├── CandidateNav.jsx
│       │   │   └── RecruiterNav.jsx
│       │   ├── Job/
│       │   │   └── JobCard.jsx
│       │   ├── Application/
│       │   │   ├── ApplicationCard.jsx
│       │   │   └── MatchScoreDisplay.jsx
│       │   └── Route/
│       │       └── ProtectedRoute.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── NotFound.jsx
│       │   ├── Auth/
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   ├── VerifyEmail.jsx
│       │   │   ├── ForgotPassword.jsx
│       │   │   └── ResetPassword.jsx
│       │   ├── Jobs/
│       │   │   ├── BrowseJobs.jsx
│       │   │   └── JobDetail.jsx
│       │   ├── Candidate/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Profile.jsx
│       │   │   ├── Applications.jsx
│       │   │   └── ApplicationDetail.jsx
│       │   └── Recruiter/
│       │       ├── Dashboard.jsx
│       │       ├── Profile.jsx
│       │       ├── MyJobs.jsx
│       │       ├── CreateJob.jsx
│       │       ├── EditJob.jsx
│       │       ├── JobApplications.jsx
│       │       └── ApplicationReview.jsx
│       ├── layouts/
│       │   ├── CandidateLayout.jsx
│       │   └── RecruiterLayout.jsx
│       ├── features/
│       │   ├── auth/
│       │   │   └── authSlice.js (Redux slice for auth)
│       │   ├── jobs/
│       │   │   └── jobsSlice.js (RTK Query API for jobs)
│       │   ├── applications/
│       │   │   └── applicationsSlice.js (RTK Query API)
│       │   └── profile/
│       │       └── profileSlice.js (RTK Query API)
│       ├── services/
│       │   └── api.js (Axios instance with interceptors)
│       ├── hooks/
│       │   └── (custom React hooks if needed)
│       ├── utils/
│       │   ├── formatDate.js
│       │   ├── colorScore.js (get color for match percentage)
│       │   └── validation.js (frontend validation helpers)
│       └── routes/
│           └── routes.jsx (route configuration)
└── docs/ (optional - for documentation)
    ├── API.md (API documentation)
    ├── SETUP.md (setup instructions)
    └── ARCHITECTURE.md (architecture overview)
```

---

## File Creation & Implementation Order

### Phase 1: Backend Setup & Database
**Location:** `backend/`

1. **Initialize backend:**
   - Create `package.json` with dependencies
   - Create `.env.example` and `.env`
   - Create `server.js` (Express server setup)

2. **Database configuration:**
   - `config/db.js` - MongoDB connection using mongoose
   - `config/gridfs.js` - GridFS initialization

3. **Models:**
   - `models/User.js` - Define User schema
   - `models/CandidateProfile.js` - Define CandidateProfile schema
   - `models/RecruiterProfile.js` - Define RecruiterProfile schema
   - `models/Job.js` - Define Job schema
   - `models/Application.js` - Define Application schema

4. **Middleware:**
   - `middleware/auth.js` - JWT verification and role checking
   - `middleware/upload.js` - Multer + GridFS storage configuration
   - `middleware/errorHandler.js` - Global error handling

### Phase 2: Authentication System
**Location:** `backend/`

1. **Services:**
   - `services/emailService.js` - Email sending (use nodemailer)
   - `utils/tokenGenerator.js` - Generate verification/reset tokens

2. **Controllers:**
   - `controllers/authController.js` - Implement all auth endpoints

3. **Validators:**
   - `validators/auth.js` - Express-validator chains for auth routes

4. **Routes:**
   - `routes/auth.js` - Mount auth endpoints
   - Connect to server.js

### Phase 3: File Upload & Resume Parsing
**Location:** `backend/`

1. **Services:**
   - `services/fileService.js` - GridFS read/write operations
   - `services/resumeParserService.js` - PDF/DOCX text extraction

2. **Controllers:**
   - `controllers/fileController.js` - File download endpoint

3. **Routes:**
   - `routes/files.js` - File routes

### Phase 4: NLP Scoring Engine
**Location:** `backend/utils/scoring/`

1. **Preprocessing:**
   - `preprocessor.js` - Text cleaning, tokenization, stemming

2. **Algorithms:**
   - `tfidf.js` - TF-IDF calculation using natural library
   - `bm25.js` - BM25 scoring using wink-bm25-text-search
   - `cosine.js` - Cosine similarity calculation
   - `keywordMatcher.js` - Keyword extraction and matching

3. **Integration:**
   - `feedbackGenerator.js` - Generate feedback text based on scores
   - `services/scoringService.js` - Main scoring orchestration

### Phase 5: Core API Endpoints
**Location:** `backend/`

1. **Profile Management:**
   - `controllers/candidateController.js` - Candidate profile CRUD
   - `controllers/recruiterController.js` - Recruiter profile CRUD
   - `validators/profiles.js` - Profile validation
   - `routes/candidates.js` - Candidate routes
   - `routes/recruiters.js` - Recruiter routes

2. **Jobs:**
   - `controllers/jobController.js` - Job CRUD operations
   - `validators/jobs.js` - Job validation
   - `routes/jobs.js` - Job routes

3. **Applications:**
   - `controllers/applicationController.js` - Application CRUD + scoring
   - `validators/applications.js` - Application validation
   - `routes/applications.js` - Application routes

### Phase 6: Frontend Setup
**Location:** `frontend/`

1. **Initialize frontend:**
   - Create `package.json` with dependencies
   - Create Vite, Tailwind, PostCSS configs
   - Create `index.html`
   - Create `src/main.jsx` and `src/App.jsx`
   - Create `src/index.css` with Tailwind imports

2. **Redux Setup:**
   - `src/store.js` - Configure Redux store
   - `src/services/api.js` - Axios instance with interceptors

3. **Authentication Slice:**
   - `src/features/auth/authSlice.js` - Auth state and thunks

### Phase 7: Public Pages
**Location:** `frontend/src/pages/`

1. **Auth Pages:**
   - `Auth/Login.jsx` - Login page with form
   - `Auth/Register.jsx` - Registration with role selection
   - `Auth/VerifyEmail.jsx` - Email verification
   - `Auth/ForgotPassword.jsx` - Password reset request
   - `Auth/ResetPassword.jsx` - Password reset form

2. **Job Browsing:**
   - `Home.jsx` - Landing page
   - `Jobs/BrowseJobs.jsx` - Public job list with filters
   - `Jobs/JobDetail.jsx` - Single job view

3. **Components:**
   - `components/Common/LoadingSpinner.jsx`
   - `components/Common/StatusBadge.jsx`
   - `components/Job/JobCard.jsx`

### Phase 8: Candidate Features
**Location:** `frontend/src/`

1. **Layout:**
   - `layouts/CandidateLayout.jsx` - Layout with navigation
   - `components/Navigation/CandidateNav.jsx`

2. **Pages:**
   - `pages/Candidate/Dashboard.jsx` - Candidate dashboard
   - `pages/Candidate/Profile.jsx` - Profile edit with resume upload
   - `pages/Candidate/Applications.jsx` - Application list
   - `pages/Candidate/ApplicationDetail.jsx` - Single application view

3. **Components:**
   - `components/Application/ApplicationCard.jsx`
   - `components/Application/MatchScoreDisplay.jsx`
   - `components/Common/FileUploadZone.jsx`
   - `components/Common/SkillTag.jsx`

4. **Redux:**
   - `features/profile/profileSlice.js` - Profile API endpoints
   - `features/applications/applicationsSlice.js` - Application API

### Phase 9: Recruiter Features
**Location:** `frontend/src/`

1. **Layout:**
   - `layouts/RecruiterLayout.jsx` - Layout with navigation
   - `components/Navigation/RecruiterNav.jsx`

2. **Pages:**
   - `pages/Recruiter/Dashboard.jsx` - Recruiter dashboard
   - `pages/Recruiter/Profile.jsx` - Company profile edit
   - `pages/Recruiter/MyJobs.jsx` - Jobs list
   - `pages/Recruiter/CreateJob.jsx` - Job creation form
   - `pages/Recruiter/EditJob.jsx` - Job edit form
   - `pages/Recruiter/JobApplications.jsx` - Ranked applications list
   - `pages/Recruiter/ApplicationReview.jsx` - Detailed application view

3. **Redux:**
   - `features/jobs/jobsSlice.js` - Jobs API endpoints

### Phase 10: Routing & Protection
**Location:** `frontend/src/`

1. **Protected Routes:**
   - `components/Route/ProtectedRoute.jsx` - Auth and role checks

2. **Route Configuration:**
   - `routes/routes.jsx` - All route definitions
   - Update `App.jsx` to use route configuration

3. **Error Pages:**
   - `pages/NotFound.jsx` - 404 page

### Phase 11: Polish & Testing
**Location:** Both `backend/` and `frontend/`

1. **Error Handling:**
   - Consistent error messages
   - Toast notifications setup
   - Form validation refinement

2. **Responsive Design:**
   - Mobile-responsive layouts
   - Tailwind responsive classes

3. **Testing:**
   - Backend API endpoint testing
   - Frontend component testing (optional)
   - End-to-end flow testing

---

## Environment Variables

### Backend Environment Variables
**File:** `backend/.env.example` (template) and `backend/.env` (actual values, not committed)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/jobmetric

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Service (choose one: nodemailer with Gmail, SendGrid, etc.)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=JobMetric <noreply@jobmetric.com>

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
```

**Email Service Options:**

**Option 1: Gmail with Nodemailer** (simplest for development)
- Use Gmail account with App Password (2FA required)
- EMAIL_SERVICE=gmail
- EMAIL_USER=your.email@gmail.com
- EMAIL_PASSWORD=your_16_char_app_password

**Option 2: SendGrid** (recommended for production)
- Sign up for SendGrid (free tier available)
- Use API key instead of username/password
- More reliable delivery

**Option 3: Mailtrap** (testing only - emails don't actually send)
- Good for development/testing
- Captures all emails in inbox

### Frontend Environment Variables
**File:** `frontend/.env.example` and `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=JobMetric
```

---

## NPM Dependencies

### Backend Dependencies
**File:** `backend/package.json`

```json
{
  "name": "jobmetric-backend",
  "version": "1.0.0",
  "description": "Job Portal with Automatic Resume Scoring - Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "multer-gridfs-storage": "^5.0.2",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "natural": "^6.7.0",
    "wink-bm25-text-search": "^2.1.1",
    "keyword-extractor": "^0.0.28",
    "stopword": "^2.0.8",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**Key Dependencies Explained:**
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT creation/verification
- **multer** + **multer-gridfs-storage**: File uploads to GridFS
- **pdf-parse**: Extract text from PDF
- **mammoth**: Extract text from DOCX
- **natural**: NLP toolkit (TF-IDF, tokenization, stemming)
- **wink-bm25-text-search**: BM25 algorithm
- **keyword-extractor**: Extract keywords from text
- **stopword**: Remove stop words
- **nodemailer**: Send emails
- **express-validator**: Request validation

### Frontend Dependencies
**File:** `frontend/package.json`

```json
{
  "name": "jobmetric-frontend",
  "version": "1.0.0",
  "description": "Job Portal with Automatic Resume Scoring - Frontend",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "axios": "^1.5.1",
    "react-hook-form": "^7.47.0",
    "yup": "^1.3.2",
    "@hookform/resolvers": "^3.3.2",
    "react-toastify": "^9.1.3",
    "react-dropzone": "^14.2.3",
    "react-icons": "^4.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.1.0",
    "vite": "^4.5.0",
    "tailwindcss": "^3.3.3",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```

**Key Dependencies Explained:**
- **react** + **react-dom**: React framework
- **react-router-dom**: Client-side routing
- **@reduxjs/toolkit**: Redux state management
- **react-redux**: React-Redux bindings
- **axios**: HTTP client
- **react-hook-form**: Form management
- **yup**: Validation schemas
- **react-toastify**: Toast notifications
- **react-dropzone**: Drag-and-drop file uploads
- **vite**: Build tool
- **tailwindcss**: Utility-first CSS

---

## Initial Setup Commands

### 1. Backend Setup
```bash
cd JobMetric
mkdir backend
cd backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors express-validator multer multer-gridfs-storage pdf-parse mammoth natural wink-bm25-text-search keyword-extractor stopword nodemailer
npm install --save-dev nodemon

# Create .env file
cp .env.example .env
# Edit .env with actual values

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
cd JobMetric
npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom @reduxjs/toolkit react-redux axios react-hook-form yup @hookform/resolvers react-toastify react-dropzone react-icons
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure Tailwind (update tailwind.config.js)
# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### 3. MongoDB Setup
```bash
# If using local MongoDB:
mongosh
use jobmetric

# If using MongoDB Atlas:
# Create cluster, get connection string, update MONGO_URI in backend/.env
```

---

## Deployment Considerations (Future)

### Backend Deployment Options:
- **Heroku**: Simple deployment with free tier
- **Railway**: Modern platform with MongoDB support
- **AWS EC2**: More control, requires setup
- **DigitalOcean**: Simple VPS

### Frontend Deployment Options:
- **Vercel**: Optimized for Vite/React
- **Netlify**: Easy deployment with CI/CD
- **Cloudflare Pages**: Fast global CDN

### Database Hosting:
- **MongoDB Atlas**: Managed MongoDB (free tier available)
- **Local MongoDB**: Development only

### File Storage (if GridFS becomes a bottleneck):
- Consider migrating to AWS S3 or Cloudinary for production
- GridFS is fine for initial implementation and moderate scale

---

## Manual Testing Checklist

After implementation, test these flows:

### Authentication Flow:
1. ✅ Register as candidate - receive verification email
2. ✅ Verify email - should redirect to login
3. ✅ Login as candidate - should go to candidate dashboard
4. ✅ Register as recruiter - verify email
5. ✅ Login as recruiter - should go to recruiter dashboard
6. ✅ Forgot password - receive reset email
7. ✅ Reset password - should work with valid token
8. ✅ Try accessing candidate route as recruiter - should get 403

### Candidate Flow:
1. ✅ Update profile information
2. ✅ Upload resume (PDF) - should succeed
3. ✅ Upload resume (DOCX) - should succeed
4. ✅ Try uploading invalid file type - should fail
5. ✅ Browse jobs - see list of open jobs
6. ✅ Search and filter jobs
7. ✅ Apply to job with resume - see match score
8. ✅ View application details - see feedback
9. ✅ View all applications - see list with statuses

### Recruiter Flow:
1. ✅ Update company profile
2. ✅ Post new job - fill all fields
3. ✅ View my jobs - see posted job
4. ✅ Edit job - modify fields
5. ✅ View applications for job - see ranked list
6. ✅ Sort by score vs date
7. ✅ View application details - see candidate info and scores
8. ✅ Download candidate resume
9. ✅ Change application status
10. ✅ Close job - status changes to closed

### Scoring Verification:
1. ✅ Apply with highly relevant resume - score >80
2. ✅ Apply with moderately relevant resume - score 50-79
3. ✅ Apply with irrelevant resume - score <50
4. ✅ Check matched skills are correct
5. ✅ Check missing skills are identified
6. ✅ Verify feedback text is appropriate

---

## Notes for Implementation Agent

### Critical Integration Points:
1. **GridFS + Resume Parsing**: Ensure uploaded files are correctly stored and text extraction works for both PDF and DOCX
2. **NLP Scoring Trigger**: Must happen synchronously during application creation to return scores immediately
3. **JWT Token Flow**: Token stored in localStorage on frontend, sent in Authorization header, verified on backend
4. **Role-Based Access**: Middleware must strictly enforce candidate vs recruiter permissions
5. **Email Sending**: Configure email service early to test registration/password reset flows

### Common Pitfalls to Avoid:
1. **CORS Issues**: Make sure backend CORS is configured for frontend URL
2. **File Size Limits**: Configure both Express body parser and multer limits
3. **MongoDB Indexes**: Create indexes as specified in schema section for performance
4. **Empty Resume Text**: Handle cases where text extraction fails gracefully
5. **Score Normalization**: Ensure all scores are properly normalized to 0-100 scale before combining

### Performance Optimization:
1. **Pagination**: Implement on all list endpoints (jobs, applications)
2. **Selective Field Population**: Don't populate unnecessary fields in list views
3. **Text Preprocessing**: Cache preprocessed job text if same job gets many applications
4. **Frontend Caching**: RTK Query handles this automatically with proper tag configuration

### Security Checklist:
1. ✅ Password hashing with bcrypt (salt rounds = 10)
2. ✅ JWT secret in environment variables, never committed
3. ✅ Email and password validation on backend (don't trust frontend)
4. ✅ Authorization checks on all protected routes
5. ✅ File type validation (MIME type + extension)
6. ✅ File size limits enforced
7. ✅ NoSQL injection prevention (mongoose handles this)
8. ✅ XSS prevention (React handles this for displayed content)
