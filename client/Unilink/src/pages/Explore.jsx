import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Users, Calendar, X, MapPin, BookOpen, ChevronDown, UserPlus, UserCheck, Loader2, Plus } from 'lucide-react';
import EventCard from '../components/EventCard/EventCard';
import PageTransition, { fadeUp, staggerContainer } from '../components/PageTransition/PageTransition';
import { connectionService, eventService } from '../services';
import { useAuth, formatImageUrl } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
export default function Explore() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ university: '' });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [discoverRes, eventsRes] = await Promise.all([
          connectionService.discoverUsers(),
          eventService.getEvents(),
        ]);
        const myId = currentUser?._id || currentUser?.id;
        setUsers((discoverRes.data || []).map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          university: u.university || 'SRM University AP',
          avatar: formatImageUrl(u.profilePicture) || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`,
          status: u.status || 'none',
        })));
        setEvents((eventsRes.data || []).map(ev => ({
          id: ev._id,
          title: ev.eventName,
          description: ev.description,
          date: new Date(ev.date).toLocaleDateString(),
          location: ev.location,
          attendees: ev.participants?.length || 0,
          image: formatImageUrl(ev.image) || `https://picsum.photos/seed/${ev._id}/300/200`,
          category: 'Tech',
          joined: ev.participants?.some(p => (p._id || p) === myId) || false,
        })));
      } catch (err) {
        console.error("Failed to fetch explore data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = query.toLowerCase();
      const matchesQuery = !query || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.university.toLowerCase().includes(q);
      const matchesUni = !filters.university || user.university.toLowerCase().includes(filters.university.toLowerCase());
      return matchesQuery && matchesUni;
    });
  }, [query, filters, users]);
  const filteredEvents = useMemo(() => events.filter((e) => !query || e.title.toLowerCase().includes(query.toLowerCase())), [query, events]);
  const clearFilters = () => { setFilters({ university: '' }); setQuery(''); };
  const hasActiveFilters = filters.university;
  const handleConnect = async (userId) => {
    try {
      await connectionService.sendRequest(userId);
      addToast('Connection request sent!', 'success');
      setUsers(us => us.map(u => u.id === userId ? { ...u, status: 'sent' } : u));
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to send request';
      addToast(msg, 'error');
    }
  };
  const handleAccept = async (userId) => {
    try {
      await connectionService.acceptRequest(userId);
      addToast('Connection accepted!', 'success');
      setUsers(us => us.filter(u => u.id !== userId));
    } catch (err) {
      addToast('Failed to accept request', 'error');
    }
  };
  const tabs = [
    { key: 'students', icon: Users, label: 'Students', count: filteredUsers.length },
    { key: 'events', icon: Calendar, label: 'Events', count: filteredEvents.length },
  ];
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display">Explore</h1>
          <p className="text-sm text-text-muted mt-0.5">Find students, events, and communities</p>
        </div>
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === 'students' ? 'Search by name or university...' : 'Search events...'}
            className="w-full glass-input rounded-2xl pl-11 pr-10 py-3.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all placeholder-text-muted" />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-light transition-all">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex bg-surface-light rounded-xl p-1">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'
                }`}>
                <tab.icon size={15} />
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-surface-lighter text-text-muted'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          {activeTab === 'students' && (
            <button onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                filterOpen || hasActiveFilters ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-surface border-border text-text-muted hover:bg-surface-light'
              }`}>
              <SlidersHorizontal size={15} /> Filters
              <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        {filterOpen && activeTab === 'students' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-surface border border-border p-5 mb-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-2"><MapPin size={12} /> University</label>
              <input type="text" value={filters.university} onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                placeholder="e.g. IIT Delhi" className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary/40 placeholder-text-muted" />
            </div>
            {hasActiveFilters && <button onClick={clearFilters} className="mt-3 text-xs text-primary hover:underline font-medium">Clear filters</button>}
          </motion.div>
        )}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
        ) : activeTab === 'students' ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <motion.div key={user.id} variants={fadeUp}>
                <div className="rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/20 transition-all group">
                  <div className="h-14 gradient-primary opacity-60" />
                  <div className="px-4 pb-4 -mt-7">
                    <Link to={`/profile/${user.id}`}>
                      <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full ring-4 ring-surface group-hover:ring-primary/20 transition-all object-cover" />
                    </Link>
                    <Link to={`/profile/${user.id}`} className="block mt-2">
                      <h3 className="font-bold text-sm group-hover:text-primary-light transition-colors">{user.name}</h3>
                    </Link>
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><BookOpen size={11} /> Student</p>
                    <p className="text-xs text-text-muted flex items-center gap-1"><MapPin size={11} /> {user.university || 'SRM University AP'}</p>
                    <p className="text-xs text-text-muted mt-2">{user.email}</p>
                    {user.status === 'sent' ? (
                      <div className="w-full mt-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-surface-light border border-border text-text-muted">
                        <UserCheck size={14} /> Requested
                      </div>
                    ) : user.status === 'received' ? (
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAccept(user.id)}
                        className="w-full mt-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 gradient-primary text-white shadow-lg hover:opacity-90">
                        <Plus size={14} /> Accept Request
                      </motion.button>
                    ) : (
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleConnect(user.id)}
                        className="w-full mt-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 gradient-primary text-white shadow-lg hover:opacity-90 transition-all">
                        <UserPlus size={14} /> Connect
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <motion.div key={event.id} variants={fadeUp}><EventCard event={event} /></motion.div>
            ))}
          </motion.div>
        )}
        {!loading && ((activeTab === 'students' && filteredUsers.length === 0) || (activeTab === 'events' && filteredEvents.length === 0)) && (
          <div className="text-center py-20">
            <Search size={40} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted font-medium">No results found</p>
            <p className="text-sm text-text-muted/70 mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
