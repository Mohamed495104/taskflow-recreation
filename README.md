# Employee Task Manager & Recreation Zone

A full-stack web application that combines professional task management with an interactive recreation zone, designed to boost productivity while fostering team engagement. Features secure authentication, modern UI components, and real-time data integration.

## 🌟 Features

### Task Management
- **CRUD Operations**: Add, view, update, and delete tasks with ease
- **Task Details**: Comprehensive task information including title, description, due date, and priority levels
- **Organized Dashboard**: Intuitive interface for efficient task tracking and management
- **Real-time Updates**: Seamless data synchronization across sessions

### Authentication & Security
- **Firebase Authentication**: Secure email/password authentication system
- **Protected Routes**: Access control ensuring only authenticated users can view dashboard and games
- **Session Management**: Persistent login state with secure logout functionality

### Recreation Zone
- **Tic Tac Toe Game**: Fully implemented interactive game for team breaks
- **Win Tracking**: User-specific game statistics stored in Firestore
- **Expandable Gaming**: Placeholder structure for additional games
- **Team Engagement**: Designed to promote workplace wellness and team bonding

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern component-based UI development
- **React Router DOM 7** - Client-side routing and navigation
- **React Bootstrap** - Professional UI component library
- **Bootstrap 5** - Responsive design framework
- **Firebase 12** - Authentication and Firestore integration
- **GraphQL Request** - Efficient API queries

### Backend
- **Node.js & Express** - Robust server-side framework
- **GraphQL** - Flexible API layer for efficient data fetching
- **MongoDB + Mongoose** - NoSQL database with object modeling
- **dotenv** - Secure environment variable management
- **CORS** - Cross-origin resource sharing configuration

## ⚙️ Installation & Setup

### Quick Start (Local Development)

For detailed local development setup, see **[LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)**

**TL;DR:**
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env and add your MONGO_URI
npm start

# Frontend (in new terminal)
cd frontend
npm install
cp .env.local .env
npm run dev
```

---

### Prerequisites
- Node.js (v20 or higher)
- MongoDB database (local or Atlas)
- Firebase project with Authentication enabled (Firestore not needed)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Mohamed495104/taskflow-recreation.git
cd taskflow-recreation
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file (copy from example):
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
```

Backend runs at: `http://localhost:5000/graphql`

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file for local development:
```bash
cp .env.local .env
```

The `.env.local` file is pre-configured for local development. If you want to use your own Firebase project, edit the `.env` file with your Firebase credentials.

Start the frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4️⃣ Verify Setup

1. Backend GraphQL Playground: http://localhost:5000/graphql
2. Frontend Application: http://localhost:5173
3. Try signing up and creating tasks

---

## 📚 Documentation

- **[LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)** - Detailed local setup guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[DATABASE_MIGRATION_ANALYSIS.md](DATABASE_MIGRATION_ANALYSIS.md)** - Database architecture
- **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)** - Implementation summary

---

## 🚨 Troubleshooting

### CORS Error
If you see: `Access to fetch at 'https://your-backend.vercel.app/graphql' has been blocked by CORS`

**Solution:** You're using the `.env.example` placeholder. Create a `.env` file:
```bash
cd frontend
cp .env.local .env
```

This sets `VITE_API_URL=http://localhost:5000/graphql` for local development.

### Backend Connection Error
If backend can't connect to MongoDB:
- Check your `MONGO_URI` in `backend/.env`
- For local MongoDB: `mongodb://localhost:27017/taskflow`
- For MongoDB Atlas: Get connection string from Atlas dashboard

### Port Already in Use
If port 5000 or 5173 is already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will automatically try other ports

For more help, see **[LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)**
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

Start the frontend development server:
```bash
npm run dev
```

## 🚀 Usage

1. **Authentication**: Sign up or log in using the Firebase authentication system
2. **Task Management**: Access the dashboard to create, view, update, and delete tasks
3. **Recreation Zone**: Navigate to the games section to play Tic Tac Toe and track your wins
4. **Data Persistence**: All tasks are stored in MongoDB, while recreation statistics are saved in Firestore

## 🔒 Environment Variables

| Variable | Description | Location |
|----------|-------------|-----------|
| `PORT` | Backend server port (default: 5000) | Backend `.env` |
| `MONGO_URI` | MongoDB connection string | Backend `.env` |
| Firebase Config | Authentication & Firestore credentials | Frontend `firebaseConfig.js` |

## 📦 Available Scripts

### Backend
- `npm start` - Run the backend server in production mode
- `npm run dev` - Run the backend server in development mode (if configured)

### Frontend
- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
