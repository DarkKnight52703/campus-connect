import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { getAdminStats } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    setLoading(true); setError(false);
    try {
      const r = await getAdminStats();
      setStats(r.data);
    } catch {
      setError(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Events', value: stats?.totalEvents ?? '—', icon: '📅', color: 'bg-purple-50 text-purple-700' },
    { label: 'Pending Events', value: stats?.pendingEvents ?? '—', icon: '⏳', color: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Overview of Campus Connect</p>
            </div>
            <Link to="/admin/events"
              className="bg-purple-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-purple-700 transition">
              + Create Event
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {cards.map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl ${c.color} mb-3`}>
                  {c.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900">{c.value}</p>
                <p className="text-gray-500 text-sm mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Recent Events</h2>
              <Link to="/admin/events" className="text-sm text-purple-600 hover:underline">View all →</Link>
            </div>
            {!stats?.recentEvents?.length ? (
              <div className="py-12 text-center text-gray-400">
                <div className="text-4xl mb-2">📅</div>
                <p>No events yet. <Link to="/admin/events" className="text-purple-600 hover:underline">Create one</Link></p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats.recentEvents.map(ev => (
                  <Link key={ev.id} to={`/admin/events/${ev.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{ev.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' at '}{ev.event_time?.slice(0, 5)}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      ev.status === 'revealed' ? 'bg-green-100 text-green-700' :
                      ev.status === 'shuffled' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {ev.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
