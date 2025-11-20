# Local Development Setup

## Quick Start for Local Development

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your MongoDB connection string:
# MONGO_URI=your_mongodb_connection_string
# PORT=5000
# FRONTEND_URL=http://localhost:5173

# Start backend server
npm start
```

The backend will run on `http://localhost:5000/graphql`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file for local development
cp .env.local .env

# The .env.local already has correct settings for local dev:
# VITE_API_URL=http://localhost:5000/graphql

# Start frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Verify Setup

1. Open http://localhost:5000/graphql in browser - you should see GraphQL playground
2. Open http://localhost:5173 - you should see the app
3. Try signing up and creating tasks

## Common Issues

### CORS Error
**Error:** `Access to fetch at 'https://your-backend.vercel.app/graphql' has been blocked by CORS`

**Solution:** 
- Make sure you created a `.env` file in the frontend directory
- The `.env` should point to `http://localhost:5000/graphql` for local development
- Don't use the `.env.example` values - those are placeholders

```bash
cd frontend
cp .env.local .env
```

### Backend Not Starting
**Error:** MongoDB connection error

**Solution:**
- Make sure you have a MongoDB instance running (local or Atlas)
- Update the `MONGO_URI` in `backend/.env`
- For local MongoDB: `MONGO_URI=mongodb://localhost:27017/taskflow`
- For MongoDB Atlas: Get connection string from Atlas dashboard

### Firebase Auth Not Working
**Error:** Firebase configuration errors

**Solution:**
- The `.env.local` file already has working Firebase config
- If you want to use your own Firebase project:
  1. Create a Firebase project
  2. Enable Email/Password authentication
  3. Get config from Firebase Console
  4. Update `.env` file with your values

## Environment Files Explained

- `.env.example` - Template for production deployment (Vercel)
- `.env.local` - Pre-configured for local development (copy to `.env`)
- `.env` - Your actual config (gitignored, never commit this)

## Production Deployment

For deploying to production, see `DEPLOYMENT_GUIDE.md`
