import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { getAdminStats } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, Calendar as CalendarIcon, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, Admin 👋</h1>
            <Link to="/admin/events" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
              Manage Events
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Users className="text-blue-500" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Events</p>
                      <p className="text-3xl font-bold text-gray-800">{stats?.totalEvents || 0}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <CalendarIcon className="text-green-500" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Pending Events</p>
                      <p className="text-3xl font-bold text-gray-800">{stats?.pendingEvents || 0}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full">
                      <Clock className="text-yellow-500" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Events</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {stats?.recentEvents?.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No events found.</div>
                  ) : (
                    stats?.recentEvents?.map(event => (
                      <div key={event.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-800">{event.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.event_date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            {' — '}{event.event_time?.slice(0,5)}
                          </p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            event.status === 'shuffled' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {event.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
