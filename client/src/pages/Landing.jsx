import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col gradient-bg text-white">
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight drop-shadow-md">Campus Connect 💜</h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl font-light opacity-90">Discover your random connection. New matches every week.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/register" className="bg-white text-primary-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1">Get Started</Link>
          <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-white/10 transition duration-300 transform hover:-translate-y-1">Login</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-left border border-white/20">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Random Match 🎲</h3>
            <p className="opacity-80">Get paired with a random person on campus for exciting new conversations.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-left border border-white/20">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">WhatsApp Connect 📱</h3>
            <p className="opacity-80">Directly connect via WhatsApp or Instagram after the reveal time.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-left border border-white/20">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Weekly Events 🔒</h3>
            <p className="opacity-80">Join exclusive weekly pairing events. Matches revealed at 4:55 PM.</p>
          </div>
        </div>
        
        <Link to="/admin" className="mt-16 text-sm opacity-60 hover:opacity-100 underline transition duration-300">Admin? Login here</Link>
      </main>
      
      <footer className="text-center p-6 text-sm opacity-80">
        Made with 💜 for campus
      </footer>
    </div>
  );
};

export default Landing;
