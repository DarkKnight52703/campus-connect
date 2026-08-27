import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import { getEventDetail, setSpecialPair, shuffleEvent, revealEvent } from '../../api';

export default function AdminEventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState('');
  const [spMale, setSpMale] = useState('');
  const [spFemale, setSpFemale] = useState('');

  const load = async () => {
    try {
      const r = await getEventDetail(id);
      setEvent(r.data);
    } catch { toast.error('Failed to load event'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const males = event?.participants?.filter(p => p.gender === 'male') || [];
  const females = event?.participants?.filter(p => p.gender === 'female') || [];
  const specialPair = event?.matches?.find(m => m.is_special_pair);
  const regularMatches = event?.matches?.filter(m => !m.is_special_pair) || [];

  const doAction = async (label, fn) => {
    setActing(label);
    try { await fn(); toast.success(`${label} done!`); await load(); }
    catch (err) { toast.error(err.response?.data?.message || `${label} failed`); }
    finally { setActing(''); }
  };

  const handleSpecialPair = () => {
    if (!spMale || !spFemale) return toast.error('Select both male and female');
    doAction('Special Pair', () => setSpecialPair(id, { maleUserId: spMale, femaleUserId: spFemale }));
  };

  const statusStyle = {
    pending:  'bg-orange-100 text-orange-700',
    shuffled: 'bg-blue-100 text-blue-700',
    revealed: 'bg-green-100 text-green-700',
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </main>
    </div>
  );

  if (!event) return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center text-gray-400">Event not found</main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <Link to="/admin/events" className="text-gray-400 hover:text-gray-600 text-sm">← Events</Link>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {new Date(event.event_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{event.event_time?.slice(0, 5)} · Reveals at {
                  (() => {
                    const [h, m] = event.event_time.split(':').map(Number);
                    const total = h * 60 + m - 5;
                    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                  })()
                }
              </p>
            </div>
            <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${statusStyle[event.status] || 'bg-gray-100 text-gray-600'}`}>
              {event.status?.toUpperCase()}
            </span>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total', value: event.participants?.length || 0, icon: '👥' },
              { label: 'Males', value: males.length, icon: '👦' },
              { label: 'Females', value: females.length, icon: '👧' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-gray-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Actions */}
            <div className="space-y-4">
              {/* Special Pair */}
              {event.status === 'pending' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">⭐ Set Special Pair <span className="text-gray-400 font-normal text-sm">(optional)</span></h3>
                  <p className="text-xs text-gray-400 mb-4">Lock in one hand-picked pair before shuffling the rest.</p>
                  <div className="space-y-3">
                    <select value={spMale} onChange={e => setSpMale(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select male participant</option>
                      {males.map(m => <option key={m.id} value={m.id}>{m.name} · {m.phone}</option>)}
                    </select>
                    <select value={spFemale} onChange={e => setSpFemale(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select female participant</option>
                      {females.map(f => <option key={f.id} value={f.id}>{f.name} · {f.phone}</option>)}
                    </select>
                    <button onClick={handleSpecialPair} disabled={!!acting}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60">
                      {acting === 'Special Pair' ? 'Setting...' : '⭐ Set Special Pair'}
                    </button>
                  </div>
                </div>
              )}

              {/* Shuffle */}
              {(event.status === 'pending' || event.status === 'shuffled') && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">🎲 Shuffle Pairs</h3>
                  <p className="text-xs text-gray-400 mb-4">Randomly pair all remaining males with females. Odd person out will be unmatched.</p>
                  <button onClick={() => doAction('Shuffle', () => shuffleEvent(id))} disabled={!!acting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60">
                    {acting === 'Shuffle' ? 'Shuffling...' : '🎲 Shuffle Now'}
                  </button>
                </div>
              )}

              {/* Reveal */}
              {event.status === 'shuffled' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">👁️ Reveal Matches</h3>
                  <p className="text-xs text-gray-400 mb-4">Make matches visible to users now. (Auto-reveals at 4:55 PM on event day)</p>
                  <button onClick={() => doAction('Reveal', () => revealEvent(id))} disabled={!!acting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60">
                    {acting === 'Reveal' ? 'Revealing...' : '👁️ Reveal Now'}
                  </button>
                </div>
              )}

              {event.status === 'revealed' && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="font-semibold text-green-700">Matches revealed!</p>
                  <p className="text-green-500 text-sm mt-1">Users can see their matches on their dashboard.</p>
                </div>
              )}
            </div>

            {/* Right: Matches */}
            <div className="space-y-4">
              {specialPair && (
                <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-5">
                  <p className="text-xs font-semibold text-yellow-700 mb-3">⭐ SPECIAL PAIR</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">👦 {specialPair.male_name}</p>
                      <p className="text-xs text-gray-400">{specialPair.male_phone}</p>
                    </div>
                    <span className="text-pink-400 text-lg">💕</span>
                    <div className="text-right">
                      <p className="font-medium text-gray-800 text-sm">👧 {specialPair.female_name}</p>
                      <p className="text-xs text-gray-400">{specialPair.female_phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {regularMatches.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="px-5 py-3 border-b border-gray-50">
                    <p className="font-semibold text-gray-700 text-sm">🎲 Shuffled Pairs ({regularMatches.length})</p>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {regularMatches.map((m, i) => (
                      <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">👦 {m.male_name}</p>
                          <p className="text-xs text-gray-400">{m.male_phone}</p>
                        </div>
                        <span className="text-pink-300 text-sm">↔️</span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">👧 {m.female_name}</p>
                          <p className="text-xs text-gray-400">{m.female_phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-5 py-3 border-b border-gray-50">
                  <p className="font-semibold text-gray-700 text-sm">👥 All Participants ({event.participants?.length || 0})</p>
                </div>
                <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                  {event.participants?.map(p => (
                    <div key={p.id} className="px-5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{p.gender === 'male' ? '👦' : '👧'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.phone}</p>
                        </div>
                      </div>
                      {p.instagram && <p className="text-xs text-gray-400">{p.instagram}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
