import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import GetStarted from './components/GetStarted';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import Tasks from './components/Tasks';
import Recreation from './components/Recreation';
import PrivateRoute from './components/auth/PrivateRoute';

// Routes based on auth state
const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
        
          <Route index element={<DashboardHome />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="recreation" element={<Recreation />} />
        </Route>

        {/* Redirects */}
        <Route path="/home" element={currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/"} replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;