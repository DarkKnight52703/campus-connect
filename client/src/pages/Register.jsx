import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerUser } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', instagram: '', gender: 'male', password: '', confirm: '' });

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    if (form.password.length < 6) return toast.error("Password must be 6+ characters");
    setLoading(true);
    try {
      const { confirm, ...data } = form;
      await registerUser(data);
      toast.success('Registered! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 px-4">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-purple-700 font-bold text-xl">Campus Connect 💜</Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">Create your account</h2>
          <p className="text-gray-500 text-sm mt-1">Join and get matched every week</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input name="name" type="text" required value={form.name} onChange={handle}
                placeholder="Your name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input name="phone" type="tel" required value={form.phone} onChange={handle}
                placeholder="91XXXXXXXXXX (with country code for WhatsApp)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram <span className="text-gray-400 font-normal">(optional)</span></label>
              <input name="instagram" type="text" value={form.instagram} onChange={handle}
                placeholder="@username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {['male', 'female'].map(g => (
                  <label key={g} className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition font-medium text-sm ${form.gender === g ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={handle} className="sr-only" />
                    <span>{g === 'male' ? '👦' : '👧'}</span>
                    <span className="capitalize">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" required value={form.password} onChange={handle}
                placeholder="Min. 6 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input name="confirm" type="password" required value={form.confirm} onChange={handle}
                placeholder="Repeat password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-purple-700 text-white font-semibold py-3 rounded-xl hover:bg-purple-800 transition disabled:opacity-60 mt-2">
              {loading ? 'Creating account...' : 'Join Campus Connect 🎲'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-700 font-medium hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
