# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the TaskFlow Recreation application to production using Vercel.

---

## Prerequisites

- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://mongodb.com/cloud/atlas)
- Firebase project (https://console.firebase.google.com)
- Git repository access

---

## 1. MongoDB Atlas Setup

### Create Database
1. Log in to MongoDB Atlas
2. Create a new cluster (or use existing)
3. Create database: `taskflow`
4. Create collections:
   - `tasks`
   - `recreationstats`
   - `tictactoematches`
   - `hangmangames`

### Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Save this for later: `mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority`

### Network Access
1. Go to "Network Access" in MongoDB Atlas
2. Add IP Address: `0.0.0.0/0` (allow all - Vercel has dynamic IPs)
3. Or add Vercel's IP ranges if available

---

## 2. Firebase Setup

### Enable Authentication
1. Go to Firebase Console
2. Navigate to Authentication
3. Enable Email/Password sign-in method

### Get Firebase Configuration
1. Go to Project Settings
2. Scroll to "Your apps"
3. Copy the firebaseConfig object values:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

### Security (Optional but Recommended)
1. Go to Firebase Console > App Check
2. Enable App Check for web app
3. Register your domain when deployed

---

## 3. Backend Deployment (Vercel)

### Step 1: Prepare Repository
```bash
cd backend
# Ensure package.json is correct
# Ensure vercel.json exists
```

### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd backend
vercel --prod
```

### Step 3: Configure Environment Variables in Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `MONGO_URI` | Your MongoDB connection string | Production |
| `PORT` | 5000 | Production |
| `FRONTEND_URL` | https://your-frontend-url.vercel.app | Production |

### Step 4: Verify Deployment
1. Visit: `https://your-backend.vercel.app/graphql`
2. You should see GraphQL Playground
3. Test with query:
```graphql
query {
  tasks {
    id
    title
  }
}
```

---

## 4. Frontend Deployment (Vercel)

### Step 1: Prepare Repository
```bash
cd frontend
# Ensure package.json is correct
# Ensure vite.config.js is correct
```

### Step 2: Configure Environment Variables in Vercel Dashboard
Before deploying, add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | https://your-backend.vercel.app/graphql | Production |
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | Production |
| `VITE_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | Production |
| `VITE_FIREBASE_PROJECT_ID` | your-project-id | Production |
| `VITE_FIREBASE_STORAGE_BUCKET` | your-project.firebasestorage.app | Production |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | Production |
| `VITE_FIREBASE_APP_ID` | Your app ID | Production |

### Step 3: Deploy to Vercel
```bash
# Deploy
cd frontend
vercel --prod
```

### Step 4: Update Backend CORS
1. Go to backend Vercel project
2. Add environment variable:
   - `FRONTEND_URL` = your frontend URL from deployment
3. Redeploy backend if needed

---

## 5. Post-Deployment Verification

### Test Authentication
1. Visit your frontend URL
2. Click "Sign Up"
3. Create a test account
4. Verify you can log in

### Test Task Management
1. Log in to your account
2. Create a new task
3. Edit the task
4. Delete the task
5. Verify all operations work

### Test Recreation Zone
1. Navigate to Recreation section
2. Play TicTacToe
3. Play Hangman
4. Verify stats are tracked

### Check Error Logs
1. Vercel Dashboard → Your Project → Logs
2. Monitor for any errors
3. Fix issues if found

---

## 6. Security Hardening (Recommended)

### Firebase Security
1. Set up Firebase Security Rules (if using Firestore):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

2. Restrict API key usage:
   - Go to Google Cloud Console
   - Navigate to Credentials
   - Edit your API key
   - Add HTTP referrer restrictions (your domain)

3. Enable App Check:
   - Protects against abuse
   - Verifies requests come from your app

### MongoDB Security
1. Use strong database password
2. Enable IP whitelist (if possible)
3. Use database user with limited permissions
4. Enable MongoDB Atlas encryption

### Rate Limiting
- Already enabled in backend (100 requests per 15 minutes per IP)
- Monitor for abuse in logs

---

## 7. Monitoring & Maintenance

### Monitor Application
1. **Vercel Analytics**: Track performance
2. **Error Logging**: Check Vercel logs regularly
3. **Database Monitoring**: MongoDB Atlas metrics

### Backup Strategy
1. **MongoDB Atlas**: Enable automated backups
2. **Code**: Maintain Git repository
3. **Environment Variables**: Keep secure backup

### Performance Optimization
1. Monitor response times in Vercel
2. Check MongoDB query performance
3. Optimize slow queries if needed

---

## 8. Troubleshooting

### Backend Issues

**Problem**: GraphQL endpoint not responding
- **Solution**: Check MONGO_URI environment variable
- **Solution**: Verify MongoDB Atlas network access

**Problem**: CORS errors
- **Solution**: Verify FRONTEND_URL in backend environment variables
- **Solution**: Check allowedOrigins array in server.js

**Problem**: Rate limiting too strict
- **Solution**: Adjust limiter settings in server.js
- **Solution**: Increase max requests or windowMs

### Frontend Issues

**Problem**: Can't connect to API
- **Solution**: Verify VITE_API_URL points to correct backend
- **Solution**: Check backend is deployed and running

**Problem**: Firebase authentication fails
- **Solution**: Verify all VITE_FIREBASE_* variables are set
- **Solution**: Check Firebase Console for enabled auth methods

**Problem**: Build fails
- **Solution**: Run `npm install` to ensure dependencies are installed
- **Solution**: Check for TypeScript/ESLint errors

### Database Issues

**Problem**: Connection timeouts
- **Solution**: Check MongoDB Atlas network access settings
- **Solution**: Verify connection string is correct

**Problem**: Data not saving
- **Solution**: Check MongoDB Atlas user permissions
- **Solution**: Verify schema matches code

---

## 9. Environment Variables Summary

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.vercel.app/graphql
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 10. Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas database created
- [ ] Firebase project configured
- [ ] All environment variables prepared
- [ ] Code tested locally

### Backend Deployment
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Deployment successful
- [ ] GraphQL endpoint accessible
- [ ] MongoDB connection working

### Frontend Deployment
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Deployment successful
- [ ] Application accessible
- [ ] API connection working

### Post-Deployment
- [ ] Authentication tested
- [ ] Task CRUD operations tested
- [ ] Recreation zone tested
- [ ] Error logs checked
- [ ] Performance verified

### Security
- [ ] Firebase security rules configured
- [ ] API keys restricted
- [ ] Rate limiting verified
- [ ] MongoDB access secured

---

## 11. Quick Deploy Commands

### Backend
```bash
cd backend
npm install
vercel --prod
```

### Frontend
```bash
cd frontend
npm install
vercel --prod
```

---

## 12. Support & Resources

### Documentation
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Firebase Docs: https://firebase.google.com/docs

### Community
- Vercel Discord: https://vercel.com/discord
- Stack Overflow: tag `vercel`, `mongodb`, `firebase`

---

## Success!

Your TaskFlow Recreation application should now be live and fully functional in production! 🎉

Monitor the application regularly and address any issues promptly.

For any questions or issues, check the troubleshooting section or consult the documentation links provided.

---

*Last Updated: November 20, 2024*
