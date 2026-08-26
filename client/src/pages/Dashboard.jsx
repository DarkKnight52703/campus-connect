import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyMatch } from '../api';
import { LogOut } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await getMyMatch();
        setMatchData(res.data);
      } catch (error) {
        console.error('Error fetching match:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, []);

  useEffect(() => {
    if (matchData && !matchData.isRevealed && matchData.revealTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const reveal = new Date(matchData.revealTime).getTime();
        const distance = reveal - now;

        if (distance < 0) {
          clearInterval(interval);
          setCountdown('Refreshing...');
          window.location.reload();
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary-700">Campus Connect 💜</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700 hidden sm:block">Hello, {user?.name?.split(' ')[0]}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
            <LogOut size={18} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow p-6 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="mt-20"><LoadingSpinner /></div>
        ) : (
          <div className="mt-8 flex flex-col items-center">
            
            {!matchData || (!matchData.matched && !matchData.pending && !matchData.isRevealed) ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border text-center w-full max-w-lg">
                <div className="text-6xl mb-4">🎲</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No active match yet</h2>
                <p className="text-gray-600">Check back later when a new event starts!</p>
              </div>
            ) : matchData.isRevealed && matchData.unmatched ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border text-center w-full max-w-lg">
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Not matched this round</h2>
                <p className="text-gray-600">You weren't paired this time. Stay tuned for the next event!</p>
              </div>
            ) : matchData.isRevealed && matchData.matched ? (
              <div className="w-full max-w-lg">
                {matchData.isSpecialPair && (
                  <div className="text-center mb-4">
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-1 rounded-full">⭐ Special Pair</span>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Your Match is Ready! 🎉</h2>
                <MatchCard partner={matchData.partner} />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-8 rounded-2xl shadow-lg text-center w-full max-w-lg text-white">
                <div className="text-6xl mb-4 animate-bounce">🔒</div>
                <h2 className="text-2xl font-bold mb-2">Your match is ready!</h2>
                <p className="opacity-90 mb-6">Revealing in:</p>
                <div className="text-4xl md:text-5xl font-mono font-bold bg-white/20 py-4 px-6 rounded-xl inline-block backdrop-blur-sm shadow-inner">
                  {countdown || 'Calculating...'}
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
