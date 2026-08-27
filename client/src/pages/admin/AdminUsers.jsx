import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { getUsers } from '../../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getUsers().then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-500 text-sm mt-1">{users.length} registered</p>
            </div>
            <input
              type="text" placeholder="Search name or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : !filtered.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 shadow-sm">
              <div className="text-4xl mb-2">👥</div>
              <p>{search ? 'No users match your search.' : 'No users registered yet.'}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Phone', 'Instagram', 'Gender', 'Joined'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{u.phone}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{u.instagram || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                          {u.gender === 'male' ? '👦 Male' : '👧 Female'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
