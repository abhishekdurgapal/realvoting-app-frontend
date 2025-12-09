import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
const API = process.env.REACT_APP_API_URL;

export default function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: decoded.name,
          email: decoded.email
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Store data from backend
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);

        // Navigate based on role
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Fan Voting Portal</h1>
        <p className="text-center mb-6 text-gray-500">Login with your Gmail to vote</p>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => alert('Google Login Failed')}
            useOneTap
          />
        </div>
        <p className="text-xs mt-6 text-gray-400 text-center">
          We use Gmail only to allow one vote per person.
        </p>
      </div>
    </div>
  );
}
