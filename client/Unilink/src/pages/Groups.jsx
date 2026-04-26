import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, X, Loader2 } from 'lucide-react';
import PageTransition, { fadeUp, staggerContainer } from '../components/PageTransition/PageTransition';
import Modal from '../components/Modal/Modal';
import { groupService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const fetchGroups = async () => {
    try {
      const { data } = await groupService.getGroups();
      const myId = currentUser?._id || currentUser?.id;
      const formatted = (data || []).map(g => ({
        id: g._id,
        name: g.groupName || g.name || 'Untitled Group',
        description: g.description || '',
        members: g.members?.length || 0,
        avatar: `https://ui-avatars.com/api/?name=${g.groupName || g.name || 'Group'}&background=random`,
        cover: `https://picsum.photos/seed/${g._id}/600/200`,
        joined: g.members?.some(m => (m.userId?._id || m.userId)?.toString() === myId) || false,
        category: 'Tech',
      }));
      setGroups(formatted);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGroups();
  }, []);
  const handleCreate = async () => {
    if (!newGroup.name.trim()) return;
    try {
      await groupService.createGroup({
        groupName: newGroup.name,
        description: newGroup.description,
      });
      addToast('Group created successfully!', 'success');
      setShowCreate(false);
      setNewGroup({ name: '', description: '' });
      fetchGroups();
    } catch (err) {
      console.error("Failed to create group:", err);
      addToast('Failed to create group', 'error');
    }
  };
  const handleJoin = async (groupId) => {
    try {
      await groupService.joinGroup(groupId);
      addToast('Joined group!', 'success');
      setGroups(gs => gs.map(g => g.id === groupId ? { ...g, joined: true, members: g.members + 1 } : g));
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to join group';
      addToast(msg, 'error');
    }
  };
  const filtered = groups.filter(g => !query || g.name.toLowerCase().includes(query.toLowerCase()));
  const categoryColors = {
    Tech: 'bg-blue-500/15 text-blue-400', Research: 'bg-purple-500/15 text-purple-400',
    Business: 'bg-amber-500/15 text-amber-400', Design: 'bg-pink-500/15 text-pink-400',
    Creative: 'bg-emerald-500/15 text-emerald-400',
  };
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display">Groups</h1>
            <p className="text-sm text-text-muted mt-0.5">Join communities and collaborate</p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity">
            <Plus size={16} /> Create Group
          </motion.button>
        </div>
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search groups..."
            className="w-full glass-input rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-primary/40 transition-all placeholder-text-muted" />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"><X size={16} /></button>}
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(group => (
              <motion.div key={group.id} variants={fadeUp}>
                <GroupCard group={group} categoryColors={categoryColors} onJoin={() => handleJoin(group.id)} />
              </motion.div>
            ))}
          </motion.div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Users size={40} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted">No groups found</p>
          </div>
        )}
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Group">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Group Name</label>
              <input type="text" value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="e.g. React Developers" className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors placeholder-text-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea value={newGroup.description} onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="What's your group about?" rows={3}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors resize-none placeholder-text-muted" />
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={!newGroup.name.trim()}
              className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
              Create Group
            </motion.button>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
}
function GroupCard({ group, categoryColors, onJoin }) {
  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/20 transition-all group">
      <div className="relative h-32 overflow-hidden">
        <img src={group.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[group.category] || 'bg-primary/15 text-primary-light'}`}>
            {group.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <img src={group.avatar} alt="" className="w-10 h-10 rounded-xl" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate group-hover:text-primary-light transition-colors">{group.name}</h3>
            <p className="text-xs text-text-muted flex items-center gap-1"><Users size={12} /> {group.members} members</p>
          </div>
        </div>
        <p className="text-xs text-text-muted line-clamp-2 mb-3">{group.description}</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={group.joined ? undefined : onJoin}
          className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            group.joined ? 'bg-success/15 text-success border border-success/30 cursor-default' : 'gradient-primary text-white shadow-lg hover:opacity-90'
          }`}>
          {group.joined ? 'Joined' : 'Join Group'}
        </motion.button>
      </div>
    </div>
  );
}
