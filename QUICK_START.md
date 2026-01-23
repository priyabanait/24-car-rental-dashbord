# Society Gate - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
Ensure you have installed:
- ✅ Node.js (v14 or higher) - [Download](https://nodejs.org/)
- ✅ MongoDB - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- ✅ Git (optional)

### Step 1: Start MongoDB

**Option A: Local MongoDB**
```powershell
# Start MongoDB service (Windows)
net start MongoDB

# Or if installed without service
mongod
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Use it in the .env file

### Step 2: Setup Backend

```powershell
# Navigate to backend directory
cd "g:\society gate\backend"

# Install dependencies (first time only)
npm install

# Create .env file from example
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

**Required .env Configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/societygate
# OR for Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/societygate
JWT_SECRET=your_very_secure_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

```powershell
# Start the backend server
npm run dev
```

✅ Backend running at `http://localhost:5000`

### Step 3: Setup Frontend

```powershell
# Open new terminal and navigate to project root
cd "g:\society gate"

# Install dependencies (first time only, if not done already)
npm install

# Start the frontend development server
npm run dev
```

✅ Frontend running at `http://localhost:5173`

### Step 4: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

## 🧪 Testing the API

### Health Check
```powershell
# Test if backend is running
curl http://localhost:5000/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Test Login (Mock)
```powershell
# Using curl
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"password\"}"
```

You should receive a JWT token in response.

## 📁 Project Structure

```
society gate/
├── backend/              # Backend API server
│   ├── config/          # Database & config
│   ├── middleware/      # Auth, validation
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── server.js        # Entry point
│   ├── package.json
│   └── .env            # Environment variables
│
├── src/                 # Frontend React app
│   ├── components/
│   │   ├── societymanagment/
│   │   │   └── Towersflats.jsx    # Enhanced page
│   │   └── ui/
│   ├── pages/
│   │   └── society/
│   │       ├── ResidentsManagement.jsx  # Enhanced page
│   │       ├── Amenities.jsx
│   │       ├── Announcements.jsx
│   │       └── ...
│   └── ...
│
└── package.json         # Frontend dependencies
```

## 🎯 Available Pages

Based on your sidebar, the following pages are available:

### Society Management
- ✅ **Towers & Flats** - `/towersflats` (Enhanced)
- ✅ **Residents** - `/society/manage/residents` (Enhanced)

### Approvals
- **Residents & Security** - `/society/approvals/users`
- **Family / Vehicles / Maids** - `/society/approvals/members`

### Services
- **Amenities** - `/society/amenities`
- **Helpdesk** - `/society/helpdesk`
- **Announcements & Wall** - `/society/announcements`
- **Polls & Results** - `/society/polls`
- **Maintenance Reports** - `/society/maintenance`
- **Directory Controls** - `/society/directory`
- **Visitor & Event Logs** - `/society/visitors`

## 📊 Backend API Endpoints

### Authentication
```
POST /api/auth/login
```

### Towers
```
GET    /api/towers
POST   /api/towers
PUT    /api/towers/:id
DELETE /api/towers/:id
```

### Flats
```
GET    /api/flats
GET    /api/flats/stats/summary
POST   /api/flats
PUT    /api/flats/:id
DELETE /api/flats/:id
```

### Residents
```
GET    /api/residents
POST   /api/residents
PUT    /api/residents/:id
PUT    /api/residents/:id/approve
DELETE /api/residents/:id
```

### And more...
See `backend/README.md` or `IMPLEMENTATION_SUMMARY.md` for complete API documentation.

## 🔧 Common Issues & Solutions

### Issue: "MongoDB connection error"
**Solution:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For Atlas, check network access and whitelist your IP

### Issue: "Port already in use"
**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change PORT in .env to different number
```

### Issue: "Cannot find module"
**Solution:**
```powershell
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

### Issue: "CORS error"
**Solution:**
- Check CORS_ORIGIN in backend/.env matches frontend URL
- Default should be `http://localhost:5173`

## 🚀 Development Workflow

### Backend Development
```powershell
cd backend
npm run dev  # Auto-restarts on file changes
```

### Frontend Development
```powershell
npm run dev  # Hot reload enabled
```

### Making Changes

1. **Add new API endpoint:**
   - Create/update model in `backend/models/`
   - Create/update route in `backend/routes/`
   - Register route in `backend/server.js`

2. **Add new frontend page:**
   - Create component in `src/pages/` or `src/components/`
   - Add route in your router configuration
   - Update sidebar if needed

## 📝 Environment Variables Reference

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/societygate

# Authentication
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🎨 Frontend Features

### Towers & Flats Page
- View all towers with statistics
- Add/Edit/Delete towers
- View all flats in a table
- Add/Edit/Delete flats
- Filter by tower and occupancy status
- Search functionality

### Residents Page
- View all residents with status
- Add/Edit/Delete residents
- Approve/Reject pending residents
- Emergency contact management
- Filter by status and type
- Advanced search

## 📚 Additional Resources

- **Backend API Documentation**: `backend/README.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express.js Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/

## 🔒 Security Notes

- Change JWT_SECRET in production
- Never commit .env file
- Use HTTPS in production
- Implement rate limiting for production
- Add input sanitization
- Regular security audits

## 💡 Next Steps

1. ✅ Backend is ready with 11 API routes
2. ✅ 2 frontend pages enhanced (Towers & Residents)
3. 🔄 Connect frontend to backend API
4. 🔄 Enhance remaining pages
5. 🔄 Add authentication flow
6. 🔄 Deploy to production

## 🆘 Need Help?

Check these files for detailed information:
- `backend/README.md` - Backend API documentation
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- Backend logs in terminal for errors
- Browser console for frontend errors

---

**Happy Coding! 🎉**

Last Updated: January 21, 2026
