import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { getEvents, createEvent, deleteEvent } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', date: '', time: '17:00' });

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Map form fields to backend expected keys
      await createEvent({
        name: formData.name,
        event_date: formData.date,
        event_time: formData.time + ':00', // add seconds
      });
      toast.success('Event created! All registered users added as participants.');
      setShowModal(false);
      setFormData({ name: '', date: '', time: '17:00' });
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      try {
        await deleteEvent(id);
        toast.success('Event deleted');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Events</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <Plus size={18} /> Create Event
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/admin/events/${event.id}`)}
                  className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition relative group border border-transparent hover:border-primary-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800 truncate pr-2">{event.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      event.status === 'shuffled' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} />
                      {new Date(event.event_date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Reveals 5 min before {event.event_time?.slice(0, 5)}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{event.participant_count || 0} participants</span>
                    <button
                      onClick={(e) => handleDelete(e, event.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {events.length === 0 && <p className="text-gray-500 col-span-full">No events yet. Create one!</p>}
            </div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">Create New Event</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Valentine Special" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                        <input type="date" required className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reveal Time</label>
                        <input type="time" required className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
