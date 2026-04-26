import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Edit3, Eye, Calendar, MapPin, Users, Loader2, X, CheckCircle, Plus } from 'lucide-react';
import { fadeUp } from '../../components/PageTransition/PageTransition';
import { eventService } from '../../services';
import { useToast } from '../../components/Toast/Toast';
export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingParticipants, setViewingParticipants] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [fetchingParticipants, setFetchingParticipants] = useState(false);
  const { addToast } = useToast();
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await eventService.getEvents();
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      addToast("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);
  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(es => es.filter(e => e._id !== id));
      addToast("Event deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete event:", err);
      addToast("Failed to delete event", "error");
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await eventService.updateEvent(editingEvent._id, editingEvent);
      addToast("Event updated successfully", "success");
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Failed to update event:", err);
      addToast("Failed to update event", "error");
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await eventService.createEvent(editingEvent);
      addToast("Event created successfully", "success");
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Failed to create event:", err);
      addToast("Failed to create event", "error");
    }
  };
  const openParticipants = async (event) => {
    setViewingParticipants(event);
    setFetchingParticipants(true);
    try {
      const { data } = await eventService.getParticipants(event._id);
      setParticipants(data || []);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      addToast("Failed to load participants", "error");
    } finally {
      setFetchingParticipants(false);
    }
  };
  const filtered = events.filter(e => 
    !query || e.eventName?.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Event Management</h1>
          <p className="text-sm text-text-muted mt-1">Manage platform events</p>
        </div>
        <button 
          onClick={() => setEditingEvent({ eventName: '', date: '', location: '', description: '', isNew: true })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all"
        >
          <Plus size={18} /> Create Event
        </button>
      </div>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events..."
          className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/40 placeholder-text-muted" />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event, i) => (
            <motion.div key={event._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-surface border border-border p-5 flex gap-4 items-center hover:border-primary/20 transition-all">
              <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Calendar size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{event.eventName}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {event.participants?.length || 0} Registered</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openParticipants(event)} className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted" title="View Participants"><Eye size={14} /></button>
                <button onClick={() => setEditingEvent(event)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-text-muted hover:text-primary-light" title="Edit Event"><Edit3 size={14} /></button>
                <button onClick={() => handleRemove(event._id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-text-muted hover:text-danger" title="Delete Event"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">No events found</div>
          )}
        </div>
      )}
      {}
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingEvent(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-light/50">
                <h2 className="font-bold">{editingEvent.isNew ? 'Create New Event' : 'Edit Event'}</h2>
                <button onClick={() => setEditingEvent(null)} className="p-1 rounded-lg hover:bg-surface-light transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={editingEvent.isNew ? handleCreate : handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Event Name</label>
                  <input type="text" required value={editingEvent.eventName} onChange={e => setEditingEvent({...editingEvent, eventName: e.target.value})} className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Date</label>
                    <input type="date" required value={editingEvent.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ''} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Location</label>
                    <input type="text" required value={editingEvent.location} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Description</label>
                  <textarea rows={4} required value={editingEvent.description} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 resize-none" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-white font-bold shadow-lg hover:opacity-90 transition-opacity">
                  {editingEvent.isNew ? 'Create Event' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {}
      <AnimatePresence>
        {viewingParticipants && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingParticipants(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-light/50">
                <div>
                  <h2 className="font-bold">Registered Users</h2>
                  <p className="text-xs text-text-muted">{viewingParticipants.eventName}</p>
                </div>
                <button onClick={() => setViewingParticipants(null)} className="p-1 rounded-lg hover:bg-surface-light transition-colors"><X size={18} /></button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {fetchingParticipants ? (
                  <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
                ) : participants.length > 0 ? (
                  <div className="space-y-3">
                    {participants.map(u => (
                      <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl bg-surface-light/50 border border-border">
                        <img src={`https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <p className="text-[10px] text-text-muted truncate">{u.email}</p>
                        </div>
                        <CheckCircle size={14} className="ml-auto text-success" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted text-sm">No users registered yet</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
