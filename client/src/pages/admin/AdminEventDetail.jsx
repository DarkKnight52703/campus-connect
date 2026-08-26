import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { getEvent, setSpecialPair, shuffleEvent, revealEvent, getEventMatches } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Shuffle, Star, Eye, Users } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    shuffled: 'bg-blue-100 text-blue-800',
    revealed: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.toUpperCase()}
    </span>
  );
};

const AdminEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null); // { event, participants, matches }
  const [detailedMatches, setDetailedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialMale, setSpecialMale] = useState('');
  const [specialFemale, setSpecialFemale] = useState('');

  const fetchData = async () => {
    try {
      const [eventRes, matchesRes] = await Promise.all([
        getEvent(id),
        getEventMatches(id),
      ]);
      setEventData(eventRes.data);
      setDetailedMatches(matchesRes.data);

      // Auto-fill special pair dropdowns if one exists
      const sp = matchesRes.data.find(m => m.is_special_pair);
      if (sp) {
        setSpecialMale(String(sp.male_user_id));
        setSpecialFemale(String(sp.female_user_id));
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSetSpecialPair = async () => {
    if (!specialMale || !specialFemale) return toast.error('Select both male and female users');
    if (specialMale === specialFemale) return toast.error('Select different users');
    try {
      await setSpecialPair(id, { maleUserId: specialMale, femaleUserId: specialFemale });
      toast.success('Special pair set! ⭐');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set special pair');
    }
  };

  const handleShuffle = async () => {
    if (!window.confirm('Shuffle remaining unmatched participants? This cannot be undone.')) return;
    try {
      const res = await shuffleEvent(id);
      toast.success(`Shuffle complete! ${res.data.matches?.length || 0} matches created.`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Shuffle failed');
    }
  };

  const handleReveal = async () => {
    if (!window.confirm('Reveal matches now? Users will see their matches immediately.')) return;
    try {
      await revealEvent(id);
      toast.success('Matches revealed! 🎉');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reveal failed');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100"><LoadingSpinner /></div>;
  if (!eventData) return <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-500">Event not found</div>;

  const { event, participants } = eventData;
  const maleParticipants = participants.filter(u => u.gender === 'male');
  const femaleParticipants = participants.filter(u => u.gender === 'female');
  const hasSpecialPair = detailedMatches.some(m => m.is_special_pair);
  const isRevealed = event.status === 'revealed';

  // Format event date nicely
  const eventDateFormatted = new Date(event.event_date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <button
              onClick={() => navigate('/admin/events')}
              className="p-2 hover:bg-gray-200 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 truncate">{event.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{eventDateFormatted} at {event.event_time?.slice(0, 5)}</p>
            </div>
            <StatusBadge status={event.status} />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-gray-800">{participants.length}</div>
              <div className="text-xs text-gray-500 mt-1">Participants</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{maleParticipants.length}</div>
              <div className="text-xs text-gray-500 mt-1">Males</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
              <div className="text-2xl font-bold text-pink-600">{femaleParticipants.length}</div>
              <div className="text-xs text-gray-500 mt-1">Females</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Special Pair Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" /> Special Pair
                <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4">This pair is locked in before the shuffle.</p>

              {hasSpecialPair && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 font-medium">
                  ⭐ Special pair is set. You can update it below.
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Male Participant</label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                    value={specialMale}
                    onChange={e => setSpecialMale(e.target.value)}
                    disabled={isRevealed}
                  >
                    <option value="">-- Select --</option>
                    {maleParticipants.map(u => (
                      <option key={u.id} value={u.id}>{u.name} (@{u.instagram || u.phone})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Female Participant</label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                    value={specialFemale}
                    onChange={e => setSpecialFemale(e.target.value)}
                    disabled={isRevealed}
                  >
                    <option value="">-- Select --</option>
                    {femaleParticipants.map(u => (
                      <option key={u.id} value={u.id}>{u.name} (@{u.instagram || u.phone})</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSetSpecialPair}
                  disabled={isRevealed || !specialMale || !specialFemale}
                  className="w-full py-2.5 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {hasSpecialPair ? 'Update Special Pair ⭐' : 'Set Special Pair ⭐'}
                </button>
              </div>
            </div>

            {/* Action Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Shuffle size={18} className="text-blue-500" /> Shuffle Remaining
                </h2>
                {!hasSpecialPair && (
                  <p className="text-xs text-orange-500 mb-2">⚠️ No special pair set — all participants will be shuffled randomly.</p>
                )}
                <p className="text-sm text-gray-500 mb-3">
                  Randomly pairs unmatched males with females using Fisher-Yates shuffle.
                </p>
                <button
                  onClick={handleShuffle}
                  disabled={isRevealed || participants.length < 2}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  <Shuffle size={18} /> Shuffle Now 🎲
                </button>
              </div>

              <div className="border-t pt-5">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Eye size={18} className="text-green-500" /> Manual Reveal
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  Auto-reveals at 4:55 PM. Force reveal instantly.
                </p>
                <button
                  onClick={handleReveal}
                  disabled={isRevealed || event.status === 'pending'}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  <Eye size={18} /> Force Reveal Now 🎉
                </button>
                {isRevealed && (
                  <p className="text-center text-green-600 text-sm font-medium mt-2">✅ Matches are live!</p>
                )}
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Users size={18} className="text-gray-500" />
              <h2 className="text-lg font-bold">Participants ({participants.length})</h2>
            </div>
            <div className="p-4">
              {participants.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No participants yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {participants.map(p => (
                    <div
                      key={p.id}
                      className={`p-3 rounded-lg border flex items-center gap-3 ${
                        p.gender === 'male' ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200'
                      }`}
                    >
                      <div className="text-xl">{p.gender === 'male' ? '👦' : '👧'}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Matches List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Matches ({detailedMatches.length})</h2>
            </div>
            <div className="p-4">
              {detailedMatches.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No matches yet. Shuffle to generate pairs.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {detailedMatches.map(match => (
                    <div
                      key={match.id}
                      className={`p-4 rounded-xl border ${
                        match.is_special_pair ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {match.is_special_pair && (
                        <div className="text-xs font-bold text-yellow-600 mb-2 flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> SPECIAL PAIR
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-center flex-1 min-w-0">
                          <p className="font-semibold text-blue-700 text-sm truncate">{match.male_name}</p>
                          <p className="text-xs text-gray-400 truncate">{match.male_phone}</p>
                        </div>
                        <div className="text-lg flex-shrink-0">💜</div>
                        <div className="text-center flex-1 min-w-0">
                          <p className="font-semibold text-pink-700 text-sm truncate">{match.female_name}</p>
                          <p className="text-xs text-gray-400 truncate">{match.female_phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminEventDetail;
