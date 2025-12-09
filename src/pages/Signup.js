import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL;

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    aadharCardNumber: '',
    password: '',
    age: '',
    address: '',
    role: 'voter'
  });

  const nav = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // Redirect based on role
        if (data.user.role === 'admin') {
          nav('/admin/dashboard');
        } else {
          nav('/dashboard');
        }
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong. Check the console for details.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Aadhar Number"
          value={form.aadharCardNumber}
          onChange={e => setForm({ ...form, aadharCardNumber: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Age"
          type="number"
          value={form.age}
          onChange={e => setForm({ ...form, age: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Address"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
        />
        <select
          className="w-full p-2 border rounded mb-4"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="voter">Voter</option>
          <option value="admin">Admin</option>
        </select>

        <button
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Sign Up
        </button>
        <button
          className="mt-2 w-full border p-2 rounded hover:bg-gray-200"
          onClick={() => nav('/login')}
        >
          Have an account? Log in
        </button>
      </div>
    </div>
  );
}
