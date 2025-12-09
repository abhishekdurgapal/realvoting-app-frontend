import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './pages/Login';
import VoterDashboard from './pages/VoterDashboard';
import AdminDashboard from './pages/AdminDashboard'; // optional
import VotingResults from './pages/VotingResults'; // optional
import ProtectedRoute from './components/ProtectedRoute';
 // adjust path if in /components

const clientId = '556274600398-c5es7eqpr27im3284ga78j1tsr3lneai.apps.googleusercontent.com'; // from Google Cloud Console

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          {/* Public login route */}
          <Route path="/" element={<Login />} />

          {/* Protected voter dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <VoterDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected admin dashboard (optional) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public or protected voting result page (optional) */}
          <Route path="/results" element={<VotingResults />} />

          {/* Fallback route */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
