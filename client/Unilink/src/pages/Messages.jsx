import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit, Loader2, MessageSquare, Plus, X, User } from 'lucide-react';
import ChatUI from '../components/ChatUI/ChatUI';
import PageTransition from '../components/PageTransition/PageTransition';
import { chatService, userService } from '../services';
import { formatImageUrl } from '../context/AuthContext';
export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const fetchConversations = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const { data } = await chatService.getConversations();
      const formatted = (data || []).map(c => ({
        id: c._id,
        user: {
          id: c.type === 'group' ? c._id : (c._id),
          name: c.name,
          avatar: formatImageUrl(c.profilePicture) || (c.type === 'group' 
            ? `https://ui-avatars.com/api/?name=${c.name || 'Group'}&background=14b8a6&color=fff`
            : `https://ui-avatars.com/api/?name=${c.name || 'User'}&background=random`),
        },
        lastMessage: c.lastMessage || 'No messages yet',
        time: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        online: false,
        unread: 0,
        type: c.type || 'individual',
      }));
      setConversations(prev => {
        if (JSON.stringify(prev) === JSON.stringify(formatted)) return prev;
        return formatted;
      });
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };
  useEffect(() => {
    fetchConversations(true);
    const interval = setInterval(() => {
      fetchConversations(false);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);
  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await userService.searchUsers(val);
      setSearchResults(data || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };
  const startNewChat = (user) => {
    const existing = conversations.find(c => c.user.id === user._id);
    if (existing) {
      setActiveConvo(existing);
    } else {
      setActiveConvo({
        id: user._id,
        user: {
          id: user._id,
          name: user.name,
          avatar: formatImageUrl(user.profilePicture) || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`
        },
        lastMessage: '',
        time: '',
        type: 'individual'
      });
    }
    setShowNewChat(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  const filtered = conversations.filter((c) => 
    c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {}
            <div className={`w-full lg:w-[340px] border-r border-border flex flex-col shrink-0 ${activeConvo ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg font-display">Messages</h2>
                  <button 
                    onClick={() => setShowNewChat(true)}
                    className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-primary"
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..."
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/30 transition-all placeholder-text-muted" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
                ) : filtered.length > 0 ? (
                  filtered.map((convo) => (
                    <motion.button key={convo.id} whileTap={{ scale: 0.98 }} onClick={() => setActiveConvo(convo)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                        activeConvo?.id === convo.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-surface-light border-l-2 border-l-transparent'
                      }`}>
                      <div className="relative shrink-0">
                        <img src={convo.user.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                        {convo.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success ring-2 ring-surface" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`text-sm truncate ${convo.unread > 0 ? 'font-bold' : 'font-medium'}`}>{convo.user.name}</h3>
                          <span className={`text-xs shrink-0 ${convo.unread > 0 ? 'text-primary font-medium' : 'text-text-muted'}`}>{convo.time}</span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${convo.unread > 0 ? 'text-text font-medium' : 'text-text-muted'}`}>{convo.lastMessage}</p>
                      </div>
                      {convo.unread > 0 && <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold shrink-0">{convo.unread}</span>}
                    </motion.button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <MessageSquare size={20} className="text-text-muted/40 mb-2" />
                    <p className="text-sm text-text-muted">{search ? 'No conversations found' : 'No conversations yet. Connect with users to start chatting!'}</p>
                    <button onClick={() => setShowNewChat(true)} className="mt-4 text-xs font-semibold text-primary hover:underline">Start a new chat</button>
                  </div>
                )}
              </div>
            </div>
            <div className={`flex-1 flex ${!activeConvo ? 'hidden lg:flex' : 'flex'}`}>
              <ChatUI conversation={activeConvo} onBack={() => setActiveConvo(null)} />
            </div>
          </div>
        </div>
      </div>
      {}
      <AnimatePresence>
        {showNewChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewChat(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-light/50">
                <h3 className="font-bold font-display">New Message</h3>
                <button onClick={() => setShowNewChat(false)} className="p-1.5 rounded-lg hover:bg-surface-light text-text-muted"><X size={18} /></button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} autoFocus
                    placeholder="Search by name or email..." 
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/40 transition-all" />
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {searching ? (
                    <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <button key={user._id} onClick={() => startNewChat(user)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-light transition-colors text-left group">
                        <img src={formatImageUrl(user.profilePicture) || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
                          className="w-10 h-10 rounded-full object-cover border border-border group-hover:border-primary/20" alt="" />
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary-light transition-colors">{user.name}</p>
                          <p className="text-[10px] text-text-muted uppercase tracking-tighter">{user.role} · {user.email}</p>
                        </div>
                      </button>
                    ))
                  ) : searchQuery ? (
                    <div className="text-center py-8 text-text-muted text-sm italic">No users found for "{searchQuery}"</div>
                  ) : (
                    <div className="text-center py-8 text-text-muted text-sm italic">Search for a student to start a conversation</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
