# Environment Variables Configuration Guide

## 📁 Backend Configuration (`backend/.env`)

### 1. **Server Configuration**
```env
NODE_ENV=development
PORT=5000
```
- `NODE_ENV`: Set to `development`, `staging`, or `production`
- `PORT`: Port number for backend server (default: 5000)

---

### 2. **MongoDB Configuration** ⭐ IMPORTANT

**Option A: Local MongoDB (for development)**
```env
MONGO_URI=mongodb://localhost:27017/jobmetric
```
- Use this if MongoDB is running on your machine
- Database name: `jobmetric`
- No authentication needed for local development

**Option B: MongoDB Atlas (Cloud - Recommended)**
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jobmetric
```

**How to get MongoDB Atlas URI:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account/cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Copy connection string
6. Replace `<password>` with your password
7. Paste into `MONGO_URI`

---

### 3. **JWT Configuration** 🔐

```env
JWT_SECRET=jobmetric_super_secret_key_2024_change_in_production
JWT_EXPIRE=7d
```

**What to change:**
- `JWT_SECRET`: Change to a long random string (used for token signing)
  - For development: `jobmetric_test_key_2024` ✅
  - For production: Use `openssl rand -hex 32` to generate

- `JWT_EXPIRE`: Token expiration time
  - `7d` = 7 days
  - `24h` = 24 hours
  - `1h` = 1 hour

---

### 4. **Email Service Configuration** 📧

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=JobMetric <noreply@jobmetric.com>
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate app-specific password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy generated password
3. Paste into `EMAIL_PASSWORD`

**For Testing (Without Email):**
- Leave as placeholder values
- Use "Verify Email Now" button in login form
- Demo endpoint: `POST /api/auth/demo-verify`

---

### 5. **Frontend URL**

```env
FRONTEND_URL=http://localhost:5173
```
- Used in email verification links
- Change for production to your actual domain

---

### 6. **File Upload**

```env
MAX_FILE_SIZE=5242880
```
- Maximum resume file size: 5MB (5,242,880 bytes)
- Do not change unless needed

---

## 📁 Frontend Configuration (`frontend/.env`)

### 1. **API Configuration** ⭐ IMPORTANT

```env
VITE_API_URL=http://localhost:5000/api
```

**What to change:**
- **Development**: `http://localhost:5000/api` ✅ (current)
- **Production**: `https://api.yourdomain.com/api`

---

### 2. **App Configuration**

```env
VITE_APP_NAME=JobMetric
```
- Application name (displayed in browser/app)
- Optional to change

---

## 🎯 Quick Setup Guide

### Development Setup (Easiest)

**Step 1: Backend .env**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobmetric
JWT_SECRET=jobmetric_dev_key_2024
JWT_EXPIRE=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=app_password_here
EMAIL_FROM=JobMetric <noreply@jobmetric.com>
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
```

**Step 2: Frontend .env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=JobMetric
```

**Step 3: MongoDB**
```bash
# Start MongoDB locally
sudo systemctl start mongodb

# OR use MongoDB Atlas (no setup needed)
```

---

### Production Setup

**Backend .env**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobmetric
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=7d
EMAIL_SERVICE=gmail
EMAIL_USER=production_email@gmail.com
EMAIL_PASSWORD=app_specific_password
EMAIL_FROM=JobMetric <noreply@jobmetric.com>
FRONTEND_URL=https://www.yourdomain.com
MAX_FILE_SIZE=5242880
```

**Frontend .env**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=JobMetric
```

---

## 🧪 Testing Without Email Service

The application has a demo verification endpoint for testing:

```bash
# After registering, verify email with:
POST /api/auth/demo-verify
{
  "email": "your_email@example.com"
}
```

Or click "Verify Email Now" button on login page.

---

## ❌ Common Issues & Solutions

### Issue 1: "Cannot connect to MongoDB"
**Solution:**
- Check if MongoDB is running: `sudo systemctl status mongodb`
- Or use MongoDB Atlas (cloud)
- Update `MONGO_URI` in `.env`

### Issue 2: "Email verification not working"
**Solution:**
- Email service not configured (OK for development)
- Use demo verification or update email credentials
- For Gmail: Use app-specific password, not regular password

### Issue 3: "API not responding"
**Solution:**
- Check `VITE_API_URL` in frontend `.env`
- Make sure it matches backend `PORT` and `FRONTEND_URL`
- For local: `http://localhost:5000/api`

### Issue 4: "CORS errors"
**Solution:**
- Backend CORS is set to `FRONTEND_URL`
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default: `http://localhost:5173`

---

## 📝 Summary

| Variable | Purpose | Example | Change? |
|----------|---------|---------|---------|
| `MONGO_URI` | Database connection | `mongodb://localhost:27017/jobmetric` | ⭐ YES |
| `JWT_SECRET` | Token signing key | `jobmetric_dev_key_2024` | ✅ Recommended |
| `JWT_EXPIRE` | Token expiration | `7d` | Optional |
| `EMAIL_USER` | Email sender | `your_email@gmail.com` | Optional |
| `EMAIL_PASSWORD` | Email password | `app_specific_password` | Optional |
| `VITE_API_URL` | Backend URL | `http://localhost:5000/api` | ⭐ YES |
| `PORT` | Backend port | `5000` | Optional |
| `NODE_ENV` | Environment | `development` | As needed |

---

## 🚀 Next Steps

1. **Update `MONGO_URI`** - Add your MongoDB connection string
2. **Update email settings** (optional) - Or use demo verification
3. **Run the application:**
   ```bash
   cd backend && npm start
   cd frontend && npm run dev
   ```
4. **Test at:** `http://localhost:5173`

Done! ✅
