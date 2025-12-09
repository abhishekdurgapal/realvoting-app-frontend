import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const storedRole = localStorage.getItem('role'); //  Get role from localStorage

  if (!token) return <Navigate to="/login" replace />;

  // Check for correct role
  if (role && storedRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
