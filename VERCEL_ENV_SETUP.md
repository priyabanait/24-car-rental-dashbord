# Vercel Environment Variables Setup

Add these environment variables in your Vercel dashboard:
(Project Settings → Environment Variables)

## Required Variables:

MONGODB_URI=mongodb+srv://priyabanait151:priya123@cluster0.vikgunr.mongodb.net/society-gate?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app

## Optional (if you deploy backend separately):
ENABLE_WEBSOCKETS=false

---

## Important Notes:

1. **Socket.IO Limitation**: Vercel serverless functions don't support WebSocket connections. 
   - Socket.IO is disabled in production on Vercel
   - Real-time notifications won't work on Vercel deployment

2. **Recommended Deployment Strategy**:
   - Option A: Deploy frontend on Vercel, backend on Render/Railway (supports WebSockets)
   - Option B: Use both on Vercel but notifications will be polling-based instead of real-time

3. **For Backend on Render/Railway**:
   - No code changes needed
   - WebSockets will work normally
   - Update CORS_ORIGIN in Vercel to point to your backend URL

4. **Current Setup**: Works on Vercel but without real-time features
