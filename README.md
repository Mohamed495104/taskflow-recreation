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

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Firebase project with Authentication and Firestore enabled

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Swedha-P/TaskFlow-Group-project-Sem3.git
cd Task-Manager-Recreation-App
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the backend server:
```bash
npm start
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
```

Create `firebaseConfig.js` in the `src/` directory with your Firebase credentials:
```javascript
// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config object
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
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
