import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMyMatch } from '../api';
import { useAuth } from '../contexts/AuthContext';

function Countdown({ revealTime }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(revealTime);
      const diff = target - now;
      if (diff <= 0) { setTimeLeft('Revealing now...'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [revealTime]);

  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-purple-700 tabular-nums">{timeLeft}</div>
      <p className="text-gray-500 text-sm mt-2">until your match is revealed</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMatch = useCallback(async () => {
    try {
      const res = await getMyMatch();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load match');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMatch(); }, [fetchMatch]);

  // Auto-refresh every 30s if not yet revealed
  useEffect(() => {
    if (data && !data.isRevealed) {
      const id = setInterval(fetchMatch, 30000);
      return () => clearInterval(id);
    }
  }, [data, fetchMatch]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto flex justify-between items-center px-6 py-4">
          <span className="font-bold text-purple-700">Campus Connect 💜</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Hey, {user?.name?.split(' ')[0]} 👋</span>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
          </div>
        ) : !data?.matched && !data?.isRevealed ? (
          /* State 1: No event / no match yet */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">You're in the pool!</h2>
            <p className="text-gray-500">
              {data?.pending
                ? "Pairs are being shuffled. Your match reveals at 4:55 PM on event day."
                : "No event scheduled yet. Check back soon — matches happen every week!"}
            </p>
            {data?.revealTime && (
              <div className="mt-8 bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
                <p className="text-sm text-gray-500 mb-4">Match reveals in</p>
                <Countdown revealTime={data.revealTime} />
              </div>
            )}
          </div>
        ) : data?.isRevealed && data?.unmatched ? (
          /* State 2: Revealed but unmatched (odd person out) */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No match this week</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Odd numbers this week — you weren't paired up. But next week's a new chance!
            </p>
          </div>
        ) : data?.isRevealed && data?.partner ? (
          /* State 3: Matched! Show partner card */
          <div>
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">{data.isSpecialPair ? '⭐' : '🎉'}</div>
              <h2 className="text-2xl font-bold text-gray-800">Your match this week!</h2>
              {data.isSpecialPair && (
                <span className="inline-block mt-2 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                  ⭐ Special Pair
                </span>
              )}
              <p className="text-gray-400 text-sm mt-2">{data.eventName}</p>
            </div>

            {/* Partner card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-4xl mx-auto mb-4">
                  💜
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.partner.name}</h3>
                <p className="text-gray-400 text-sm mb-6">Say hello 👋</p>

                <div className="space-y-3">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${data.partner.phone.replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3.5 rounded-xl transition"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Chat on WhatsApp
                  </a>

                  {/* Instagram */}
                  {data.partner.instagram && (
                    <a
                      href={`https://instagram.com/${data.partner.instagram.replace('@', '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white font-semibold py-3.5 rounded-xl transition"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      {data.partner.instagram}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Be kind, be respectful. Have a great conversation! 💜
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
