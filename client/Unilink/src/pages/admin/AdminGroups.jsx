import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Eye, Users, Loader2, X, Plus, UserMinus, UserPlus, MessageSquare } from 'lucide-react';
import { fadeUp } from '../../components/PageTransition/PageTransition';
import { groupService, adminService, chatService } from '../../services';
import { useToast } from '../../components/Toast/Toast';
import { formatImageUrl } from '../../context/AuthContext';
export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingGroup, setViewingGroup] = useState(null);
  const [viewingMessages, setViewingMessages] = useState(null);
  const [messages, setMessages] = useState([]);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const { addToast } = useToast();
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data } = await groupService.getGroups();
      setGroups(data || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      addToast("Failed to load groups", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const { data } = await adminService.getAllUsers();
      setAllUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };
  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group and all its messages?")) return;
    try {
      await groupService.deleteGroup(id);
      setGroups(gs => gs.filter(g => g._id !== id));
      addToast("Group deleted", "success");
    } catch (err) {
      addToast("Delete failed", "error");
    }
  };
  const removeMember = async (groupId, userId) => {
    try {
      await groupService.removeMember(groupId, userId);
      addToast("Member removed", "success");
      setViewingGroup(prev => ({
        ...prev,
        members: prev.members.filter(m => m.userId?._id !== userId)
      }));
      setGroups(gs => gs.map(g => g._id === groupId ? {
        ...g,
        members: g.members.filter(m => m.userId?._id !== userId)
      } : g));
    } catch (err) {
      addToast("Action failed", "error");
    }
  };
  const addMember = async (groupId, userId) => {
    try {
      await groupService.addMember(groupId, userId);
      addToast("Member added", "success");
      setShowAddMember(false);
      fetchGroups();
      const { data } = await groupService.getGroups();
      const updated = data.find(g => g._id === groupId);
      setViewingGroup(updated);
    } catch (err) {
      addToast(err.response?.data?.msg || "Action failed", "error");
    }
  };
  const openMessages = async (group) => {
    setViewingMessages(group);
    setFetchingMessages(true);
    try {
      const { data } = await chatService.getGroupMessages(group._id);
      setMessages(data || []);
    } catch (err) {
      addToast("Failed to load messages", "error");
    } finally {
      setFetchingMessages(false);
    }
  };
  const filtered = groups.filter(g => 
    !query || g.groupName?.toLowerCase().includes(query.toLowerCase())
  );
  const filteredUsers = allUsers.filter(u => 
    (!userQuery || u.name.toLowerCase().includes(userQuery.toLowerCase())) &&
    !viewingGroup?.members.some(m => m.userId?._id === u._id)
  );
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Group Moderation</h1>
        <p className="text-sm text-text-muted mt-1">Monitor and manage community groups</p>
      </div>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search groups..."
          className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/40 placeholder-text-muted" />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group, i) => (
            <motion.div key={group._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-surface border border-border p-5 hover:border-primary/20 transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <Users size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{group.groupName}</h3>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{group.members?.length || 0} Members</p>
                </div>
              </div>
              <p className="text-xs text-text-muted line-clamp-2 mb-5 flex-1">{group.description || 'No description provided.'}</p>
              <div className="flex gap-2 pt-4 border-t border-border">
                <button onClick={() => setViewingGroup(group)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-light text-xs font-medium hover:bg-surface-lighter transition-colors">
                  <Users size={14} /> Members
                </button>
                <button onClick={() => openMessages(group)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-light text-xs font-medium hover:bg-surface-lighter transition-colors">
                  <MessageSquare size={14} /> Chats
                </button>
                <button onClick={() => handleDelete(group._id)} className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {}
      <AnimatePresence>
        {viewingGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingGroup(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-light/50">
                <div>
                  <h2 className="font-bold">Group Members</h2>
                  <p className="text-xs text-text-muted">{viewingGroup.groupName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowAddMember(true)} className="p-2 rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity" title="Add Member"><Plus size={16} /></button>
                  <button onClick={() => setViewingGroup(null)} className="p-1 rounded-lg hover:bg-surface-light transition-colors"><X size={18} /></button>
                </div>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                {viewingGroup.members.filter(m => m.userId).map(m => (
                  <div key={m.userId._id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-light/50 border border-border group">
                    <img src={formatImageUrl(m.userId.profilePicture) || `https://ui-avatars.com/api/?name=${m.userId.name || 'User'}&background=random`} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{m.userId.name}</p>
                      <p className="text-[10px] text-text-muted truncate uppercase tracking-tighter">{m.role} · {m.userId.university}</p>
                    </div>
                    {m.role !== 'admin' && (
                      <button onClick={() => removeMember(viewingGroup._id, m.userId._id)} className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {}
      <AnimatePresence>
        {showAddMember && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMember(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-sm">Add New Member</h3>
                <button onClick={() => setShowAddMember(false)} className="p-1 rounded-lg hover:bg-surface-light transition-colors"><X size={16} /></button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" value={userQuery} onChange={e => setUserQuery(e.target.value)} placeholder="Search students..."
                    className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-primary/40" />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredUsers.map(u => (
                    <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-light transition-colors group">
                      <img src={formatImageUrl(u.profilePicture) || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{u.name}</p>
                        <p className="text-[9px] text-text-muted truncate">{u.university}</p>
                      </div>
                      <button onClick={() => addMember(viewingGroup._id, u._id)} className="p-1.5 rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity">
                        <UserPlus size={14} />
                      </button>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && <p className="text-center py-4 text-xs text-text-muted">No users found</p>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {}
      <AnimatePresence>
        {viewingMessages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingMessages(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-light/50">
                <div>
                  <h2 className="font-bold">Group Messages</h2>
                  <p className="text-xs text-text-muted">Moderation View · {viewingMessages.groupName}</p>
                </div>
                <button onClick={() => setViewingMessages(null)} className="p-1 rounded-lg hover:bg-surface-light transition-colors"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {fetchingMessages ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
                ) : messages.length > 0 ? (
                  messages.map((m, i) => (
                    <div key={m._id} className="flex gap-3">
                      <img src={formatImageUrl(m.sender?.profilePicture) || `https://ui-avatars.com/api/?name=${m.sender?.name || 'User'}&background=random`} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold">{m.sender?.name || 'Unknown'}</span>
                          <span className="text-[10px] text-text-muted">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="px-3 py-2 rounded-2xl bg-surface-light border border-border text-sm inline-block max-w-full">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-text-muted italic">No messages in this group yet</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
