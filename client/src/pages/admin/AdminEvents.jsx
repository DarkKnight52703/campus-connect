import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import { getEvents, createEvent, deleteEvent } from '../../api';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', event_date: '', event_time: '17:00' });

  const load = async () => {
    try { const r = await getEvents(); setEvents(r.data); }
    catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async e => {
    e.preventDefault();
    if (!form.name || !form.event_date) return toast.error('Fill in all fields');
    setCreating(true);
    try {
      await createEvent({ name: form.name, event_date: form.event_date, event_time: form.event_time });
      toast.success('Event created!');
      setShowForm(false);
      setForm({ name: '', event_date: '', event_time: '17:00' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally { setCreating(false); }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteEvent(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const statusStyle = {
    pending:  'bg-orange-100 text-orange-700',
    shuffled: 'bg-blue-100 text-blue-700',
    revealed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-500 text-sm mt-1">Create and manage pairing events</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-purple-700 transition">
              {showForm ? 'Cancel' : '+ New Event'}
            </button>
          </div>

          {/* Create Event Form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Create New Event</h3>
              <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Event Name</label>
                  <input name="name" value={form.name} onChange={handle} required
                    placeholder="e.g. Week 1 Shuffle"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input name="event_date" type="date" value={form.event_date} onChange={handle} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Time (reveal - 5 min)</label>
                  <input name="event_time" type="time" value={form.event_time} onChange={handle}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button type="submit" disabled={creating}
                    className="bg-purple-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-purple-700 transition disabled:opacity-60">
                    {creating ? 'Creating...' : 'Create Event →'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : !events.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 shadow-sm">
              <div className="text-4xl mb-2">📅</div>
              <p>No events yet. Click "+ New Event" to create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl shrink-0">📅</div>
                    <div>
                      <p className="font-semibold text-gray-900">{ev.name}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(ev.event_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{ev.event_time?.slice(0, 5)}
                        {' · '}{ev.participant_count || 0} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[ev.status] || 'bg-gray-100 text-gray-600'}`}>
                      {ev.status}
                    </span>
                    <Link to={`/admin/events/${ev.id}`}
                      className="text-sm text-purple-600 font-medium hover:underline">
                      Manage →
                    </Link>
                    <button onClick={() => remove(ev.id, ev.name)}
                      className="text-sm text-red-400 hover:text-red-600 transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
