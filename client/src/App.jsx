import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AdminAuthProvider, useAuth, useAdminAuth } from './contexts/AuthContext';

import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventDetail from './pages/admin/AdminEventDetail';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { token } = useAdminAuth();
  if (!token) return <Navigate to="/admin" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
          <Route path="/admin/events/:id" element={<AdminRoute><AdminEventDetail /></AdminRoute>} />
        </Routes>
      </AdminAuthProvider>
    </AuthProvider>
  );
};

export default App;
