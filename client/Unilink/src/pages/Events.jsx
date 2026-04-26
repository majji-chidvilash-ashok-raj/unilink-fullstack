import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Search, Check } from 'lucide-react';
import PageTransition, { fadeUp, staggerContainer } from '../components/PageTransition/PageTransition';
import EventRegistrationModal from '../components/EventRegistrationModal/EventRegistrationModal';
import { eventService } from '../services';
import { useAuth, formatImageUrl } from '../context/AuthContext';
export default function Events() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [registerEvent, setRegisterEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await eventService.getEvents();
        const myId = currentUser?._id || currentUser?.id;
        const formattedEvents = data.map(ev => ({
          id: ev._id,
          title: ev.eventName,
          description: ev.description,
          date: new Date(ev.date).toLocaleDateString(),
          location: ev.location,
          attendees: ev.participants?.length || 0,
          image: formatImageUrl(ev.image) || `https://picsum.photos/seed/${ev._id}/400/300`,
          category: 'Tech',
          joined: ev.participants?.some(p => (p._id || p) === myId) || false,
          featured: false
        }));
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  const categories = ['All', 'Tech', 'Workshop', 'Entrepreneurship', 'Design', 'Academic'];
  const categoryColors = {
    Tech: 'bg-blue-500/15 text-blue-400',
    Workshop: 'bg-purple-500/15 text-purple-400',
    Entrepreneurship: 'bg-amber-500/15 text-amber-400',
    Design: 'bg-pink-500/15 text-pink-400',
    Academic: 'bg-emerald-500/15 text-emerald-400',
  };
  const filtered = events.filter(e => {
    const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === 'All' || e.category === category;
    return matchQuery && matchCat;
  });
  const featured = filtered.find(e => e.featured);
  const handleRegisterClick = (e, event) => {
    if (e) e.preventDefault();
    if (event.joined) {
      setEvents(es => es.map(ev => ev.id === event.id ? { ...ev, joined: false, attendees: ev.attendees - 1 } : ev));
    } else {
      setRegisterEvent(event);
    }
  };
  const handleRegistered = () => {
    if (registerEvent) {
      setEvents(es => es.map(ev => ev.id === registerEvent.id ? { ...ev, joined: true, attendees: ev.attendees + 1 } : ev));
    }
  };
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display">Events</h1>
          <p className="text-sm text-text-muted mt-0.5">Discover campus events and opportunities</p>
        </div>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events..."
            className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/40 transition-all placeholder-text-muted" />
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat ? 'gradient-primary text-white shadow-sm' : 'bg-surface border border-border text-text-muted hover:bg-surface-light'
              }`}>
              {cat}
            </button>
          ))}
        </div>
        {featured && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl bg-surface border border-border overflow-hidden gradient-border">
            <div className="md:flex">
              <div className="md:w-1/2 h-56 md:h-auto relative overflow-hidden">
                <img src={featured.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 md:w-1/2 flex flex-col justify-center">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold w-fit mb-3 ${categoryColors[featured.category] || 'bg-primary/15 text-primary-light'}`}>
                  ⭐ Featured · {featured.category}
                </span>
                <h2 className="text-xl font-bold font-display mb-2">{featured.title}</h2>
                <p className="text-sm text-text-muted mb-4">{featured.description}</p>
                <div className="space-y-1.5 text-sm text-text-muted mb-4">
                  <p className="flex items-center gap-2"><Calendar size={14} className="text-primary-light" /> {featured.date}</p>
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-primary-light" /> {featured.location}</p>
                  <p className="flex items-center gap-2"><Users size={14} className="text-primary-light" /> {featured.attendees} attending</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleRegisterClick(null, featured)}
                  className={`w-fit px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                    featured.joined ? 'bg-success/15 text-success border border-success/30' : 'gradient-primary text-white shadow-lg hover:opacity-90'
                  }`}>
                  {featured.joined ? <><Check size={14} /> Registered</> : 'Register Now'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        <motion.div variants={staggerContainer} initial="initial" animate="animate"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(event => (
            <motion.div key={event.id} variants={fadeUp}>
              <Link to={`/events/${event.id}`} className="block rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/20 transition-all group">
                <div className="relative h-40 overflow-hidden">
                  <img src={event.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[event.category] || 'bg-primary/15 text-primary-light'}`}>
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm group-hover:text-primary-light transition-colors">{event.title}</h3>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{event.description}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-text-muted flex items-center gap-2"><Calendar size={12} className="text-primary-light" /> {event.date}</p>
                    <p className="text-xs text-text-muted flex items-center gap-2"><Users size={12} className="text-primary-light" /> {event.attendees} attending</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => handleRegisterClick(e, event)}
                    className={`w-full mt-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      event.joined ? 'bg-success/15 text-success border border-success/30' : 'gradient-primary text-white shadow-lg hover:opacity-90'
                    }`}>
                    {event.joined ? <><Check size={14} /> Registered</> : 'Register'}
                  </motion.button>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Calendar size={40} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted">No events found</p>
          </div>
        )}
      </div>
      {}
      <EventRegistrationModal
        event={registerEvent || {}}
        isOpen={!!registerEvent}
        onClose={() => setRegisterEvent(null)}
        onRegistered={handleRegistered}
      />
    </PageTransition>
  );
}
