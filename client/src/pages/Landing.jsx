import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-purple-700">Campus Connect 💜</span>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition">Login</Link>
          <Link to="/register" className="text-sm font-medium bg-purple-700 text-white px-4 py-2 rounded-full hover:bg-purple-800 transition">Join Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-xl">
          <div className="text-6xl mb-6">💌</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Meet someone new<br />
            <span className="text-purple-700">on campus</span> this week
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Every week, you get paired with a random campus student.<br />
            Matches reveal at <strong>4:55 PM</strong> — connect via WhatsApp instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-purple-700 text-white font-semibold py-3 px-8 rounded-full hover:bg-purple-800 transition shadow-lg">
              Get My Match 🎲
            </Link>
            <Link to="/login" className="border border-purple-700 text-purple-700 font-semibold py-3 px-8 rounded-full hover:bg-purple-50 transition">
              Already joined? Login
            </Link>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">✍️</div>
              <h3 className="font-semibold text-gray-800 mb-1">1. Register</h3>
              <p className="text-gray-500 text-sm">Sign up with your name, phone & Instagram. Takes 30 seconds.</p>
            </div>
            <div>
              <div className="text-4xl mb-3">🎲</div>
              <h3 className="font-semibold text-gray-800 mb-1">2. Get paired</h3>
              <p className="text-gray-500 text-sm">Every week, boys and girls are randomly matched by our algorithm.</p>
            </div>
            <div>
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-800 mb-1">3. Connect</h3>
              <p className="text-gray-500 text-sm">At 4:55 PM, your match is revealed. Chat on WhatsApp or DM on Instagram.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100">
        Campus Connect · Made with 💜 · <Link to="/admin" className="hover:text-purple-600">Admin</Link>
      </footer>
    </div>
  );
}
