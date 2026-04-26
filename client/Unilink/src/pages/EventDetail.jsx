import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Check, Share2, Loader2 } from 'lucide-react';
import PageTransition from '../components/PageTransition/PageTransition';
import { eventService } from '../services';
import { useAuth } from '../context/AuthContext';
export default function EventDetail() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [joined, setJoined] = useState(false);
  const [attendees, setAttendees] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventService.getEvents();
        const found = (data || []).find(e => e._id === id);
        if (found) {
          const myId = currentUser?._id || currentUser?.id;
          const isJoined = found.participants?.some(p => (p._id || p) === myId) || false;
          setEvent({
            id: found._id,
            title: found.eventName,
            description: found.description || '',
            date: new Date(found.date).toLocaleDateString(),
            location: found.location || 'TBD',
            attendees: found.participants?.length || 0,
            image: `https://picsum.photos/seed/${found._id}/800/600`,
            category: 'Tech',
            joined: isJoined,
          });
          setJoined(isJoined);
          setAttendees(found.participants?.length || 0);
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);
  const handleJoin = async () => {
    if (joined) return;
    try {
      await eventService.joinEvent(id);
      setJoined(true);
      setAttendees(c => c + 1);
    } catch (err) {
      console.error("Failed to join event:", err);
    }
  };
  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-10 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }
  if (!event) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-10 text-center">
          <p className="text-text-muted">Event not found</p>
          <Link to="/events" className="text-primary text-sm hover:underline mt-2 inline-block">Back to Events</Link>
        </div>
      </PageTransition>
    );
  }
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <Link to="/events" className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Events
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-64 sm:h-80 object-cover" />
          </div>
          <div className="mt-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary-light mb-3">
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold font-display">{event.title}</h1>
              </div>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleJoin}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    joined ? 'bg-success/15 text-success border border-success/30' : 'gradient-primary text-white shadow-lg hover:opacity-90 glow-sm'
                  }`}>
                  {joined ? <><Check size={16} /> Registered</> : 'Register Now'}
                </motion.button>
                <button className="p-3 rounded-xl bg-surface border border-border hover:bg-surface-light transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
            <p className="mt-4 text-text-muted leading-relaxed">{event.description}</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="rounded-xl bg-surface border border-border p-4 space-y-3">
                <h3 className="font-semibold text-sm">Details</h3>
                <div className="space-y-2 text-sm text-text-muted">
                  <p className="flex items-center gap-2"><Calendar size={14} className="text-primary-light" /> {event.date}</p>
                  <p className="flex items-center gap-2"><Clock size={14} className="text-primary-light" /> 9:00 AM - 6:00 PM</p>
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-primary-light" /> {event.location}</p>
                  <p className="flex items-center gap-2"><Users size={14} className="text-primary-light" /> {attendees} attending</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
