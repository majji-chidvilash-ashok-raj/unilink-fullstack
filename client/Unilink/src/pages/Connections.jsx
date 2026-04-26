import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, UserX, Users, Search, X, Loader2 } from 'lucide-react';
import PageTransition, { fadeUp, staggerContainer } from '../components/PageTransition/PageTransition';
import { connectionService } from '../services';
import { useToast } from '../components/Toast/Toast';
export default function Connections() {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reqRes, connRes, discRes] = await Promise.all([
        connectionService.getPendingRequests(),
        connectionService.getConnections(),
        connectionService.discoverUsers(),
      ]);
      setRequests(reqRes.data || []);
      setConnections(connRes.data || []);
      setSuggestions(discRes.data || []);
    } catch (err) {
      console.error("Failed to fetch connections:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleAccept = async (userId) => {
    try {
      await connectionService.acceptRequest(userId);
      addToast('Connection accepted!', 'success');
      fetchAll();
    } catch (err) {
      console.error("Failed to accept:", err);
      addToast('Failed to accept request', 'error');
    }
  };
  const handleDecline = async (userId) => {
    try {
      await connectionService.declineRequest(userId);
      addToast('Request declined', 'info');
      setRequests(r => r.filter(req => (req._id || req.id) !== userId));
    } catch (err) {
      console.error("Failed to decline:", err);
    }
  };
  const handleConnect = async (userId) => {
    try {
      await connectionService.sendRequest(userId);
      addToast('Connection request sent!', 'success');
      setSuggestions(s => s.filter(u => (u._id || u.id) !== userId));
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to send request';
      addToast(msg, 'error');
    }
  };
  const tabs = [
    { key: 'requests', label: 'Requests', count: requests.length },
    { key: 'connections', label: 'My Connections', count: connections.length },
    { key: 'suggestions', label: 'Suggestions', count: suggestions.length },
  ];
  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-10 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display">Connections</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage your network and connect with students</p>
        </div>
        {}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'gradient-primary text-white shadow-lg' : 'bg-surface border border-border text-text-muted hover:bg-surface-light'}`}>
              {t.label} <span className="ml-1 opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
        {}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search connections..."
            className="w-full glass-input rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-primary/40 transition-all placeholder-text-muted" />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"><X size={16} /></button>}
        </div>
        {tab === 'requests' && (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
            {requests.filter(r => !query || r.name?.toLowerCase().includes(query.toLowerCase())).map(req => (
              <motion.div key={req._id} variants={fadeUp}
                className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-primary/20 transition-colors">
                <Link to={`/profile/${req._id}`}>
                  <img src={req.profilePicture || `https://ui-avatars.com/api/?name=${req.name || 'User'}&background=random`} className="w-12 h-12 rounded-full object-cover border border-border" alt="" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${req._id}`} className="font-semibold hover:text-primary-light transition-colors">{req.name}</Link>
                  <p className="text-sm text-text-muted">{req.role || 'Student'} · {req.university || 'SRM University AP'}</p>
                  <p className="text-xs text-text-muted mt-0.5">{req.email}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAccept(req._id)}
                    className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity">
                    <UserCheck size={16} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDecline(req._id)}
                    className="px-4 py-2 rounded-xl bg-surface-light border border-border text-sm text-text-muted hover:text-danger hover:border-danger/30 transition-all">
                    <UserX size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-16">
                <Users size={40} className="text-text-muted/30 mx-auto mb-3" />
                <p className="text-text-muted">No pending requests</p>
              </div>
            )}
          </motion.div>
        )}
        {tab === 'connections' && (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.filter(u => !query || u.name?.toLowerCase().includes(query.toLowerCase())).map(user => (
              <motion.div key={user._id} variants={fadeUp}>
                <div className="rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/20 transition-all group">
                  <div className="h-16 gradient-primary opacity-60" />
                  <div className="px-4 pb-4 -mt-7">
                    <Link to={`/profile/${user._id}`}>
                      <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`} className="w-14 h-14 rounded-full ring-4 ring-surface object-cover" alt="" />
                    </Link>
                    <Link to={`/profile/${user._id}`} className="block mt-2">
                      <h3 className="font-bold text-sm group-hover:text-primary-light transition-colors">{user.name}</h3>
                      <p className="text-xs text-text-muted">{user.role || 'Student'} · {user.university || 'SRM University AP'}</p>
                    </Link>
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">{user.email}</p>
                    <div className="w-full mt-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-surface-light border border-border text-text-muted">
                      <UserCheck size={14} /> Connected
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {connections.length === 0 && (
              <div className="col-span-full text-center py-16">
                <Users size={40} className="text-text-muted/30 mx-auto mb-3" />
                <p className="text-text-muted">No connections yet</p>
              </div>
            )}
          </motion.div>
        )}
        {tab === 'suggestions' && (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.filter(u => !query || u.name?.toLowerCase().includes(query.toLowerCase())).map(user => (
              <motion.div key={user._id} variants={fadeUp}>
                <div className="rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/20 transition-all group">
                  <div className="h-16 gradient-primary opacity-60" />
                  <div className="px-4 pb-4 -mt-7">
                    <img src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`} className="w-14 h-14 rounded-full ring-4 ring-surface object-cover" alt="" />
                    <h3 className="font-bold text-sm mt-2 group-hover:text-primary-light transition-colors">{user.name}</h3>
                    <p className="text-xs text-text-muted">{user.university || 'SRM University AP'}</p>
                    <p className="text-xs text-text-muted mt-1">{user.email}</p>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleConnect(user._id)}
                      className="w-full mt-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 gradient-primary text-white shadow-lg hover:opacity-90">
                      <UserPlus size={14} /> Connect
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
            {suggestions.length === 0 && (
              <div className="col-span-full text-center py-16">
                <Users size={40} className="text-text-muted/30 mx-auto mb-3" />
                <p className="text-text-muted">No suggestions right now</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
