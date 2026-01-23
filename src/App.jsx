import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Towersflats from './components/societymanagment/Towersflats.jsx';
import AdminNotification from './components/notifications/AdminNotification.jsx';
// import Residents from './pages/society/Residents.jsx';
import ResidentsManagement from './pages/society/ResidentsManagement.jsx';
import ApprovalsUsers from './pages/society/ApprovalsUsers.jsx';
import ApprovalsMembers from './pages/society/ApprovalsMembers.jsx';
import Amenities from './pages/society/Amenities.jsx';
import Helpdesk from './pages/society/Helpdesk.jsx';
import Announcements from './pages/society/Announcements.jsx';
import Polls from './pages/society/Polls.jsx';
import Maintenance from './pages/society/Maintenance.jsx';
import Directory from './pages/society/Directory.jsx';
import Visitors from './pages/society/Visitors.jsx';
// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public standalone Driver Login (not redirected even if authenticated) */}
  
 

    {/* Public Investor routes */}
   
      
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="towersflats" element={<Towersflats />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="notification" element={<AdminNotification />} />

        {/* Society management routes */}
        <Route path="society/manage/residents" element={<ResidentsManagement />} />
        <Route path="society/approvals/users" element={<ApprovalsUsers />} />
        <Route path="society/approvals/members" element={<ApprovalsMembers />} />
        <Route path="society/amenities" element={<Amenities />} />
        <Route path="society/helpdesk" element={<Helpdesk />} />
        <Route path="society/announcements" element={<Announcements />} />
        <Route path="society/polls" element={<Polls />} />
        <Route path="society/maintenance" element={<Maintenance />} />
        <Route path="society/directory" element={<Directory />} />
        <Route path="society/visitors" element={<Visitors />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
