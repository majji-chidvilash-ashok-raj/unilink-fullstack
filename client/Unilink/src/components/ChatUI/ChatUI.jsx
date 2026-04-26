import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Phone, Video, MoreVertical, Smile, Loader2 } from 'lucide-react';
import { chatService } from '../../services';
import { useAuth, formatImageUrl } from '../../context/AuthContext';
export default function ChatUI({ conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const { user: currentUser } = useAuth();
  const fetchMessages = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const userId = conversation.user?.id || conversation.id;
      const isGroup = conversation.type === 'group';
      const { data } = isGroup ? await chatService.getGroupMessages(userId) : await chatService.getDirectMessages(userId);
      const formatted = (data || []).map(m => {
        const date = m.createdAt ? new Date(m.createdAt) : new Date();
        return {
          id: m._id,
          senderId: m.sender?._id || m.sender,
          senderName: m.sender?.name || 'Unknown',
          senderAvatar: formatImageUrl(m.sender?.profilePicture) || `https://ui-avatars.com/api/?name=${m.sender?.name || 'User'}&background=random`,
          text: m.text,
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(formatted)) return prev;
        return formatted;
      });
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      if (isInitial) setMessages([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  };
  useEffect(() => {
    if (!conversation) return;
    fetchMessages(true);
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000); 
    return () => clearInterval(interval);
  }, [conversation?.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center mx-auto mb-4">
            <Send size={24} className="text-text-muted/40" />
          </div>
          <h3 className="font-semibold text-text-muted">Select a conversation</h3>
          <p className="text-sm text-text-muted/60 mt-1">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }
  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderId: currentUser?._id || currentUser?.id,
      senderName: currentUser?.name,
      text,
      time: 'Now',
    };
    setMessages(prev => [...prev, tempMsg]);
    try {
      const userId = conversation.user?.id || conversation.id;
      const isGroup = conversation.type === 'group';
      const { data } = isGroup 
        ? await chatService.sendGroupMessage(userId, { text }) 
        : await chatService.sendDirectMessage(userId, { text });
      setMessages(prev =>
        prev.map(m => m.id === tempMsg.id ? {
          id: data._id,
          senderId: data.sender?._id || data.sender,
          senderName: data.sender?.name || currentUser?.name,
          text: data.text,
          time: data.createdAt ? new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
        } : m)
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };
  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const myId = currentUser?._id || currentUser?.id;
  return (
    <div className="flex-1 flex flex-col">
      {}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={onBack} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-light transition-colors text-text-muted">
          <ArrowLeft size={18} />
        </button>
        <img src={conversation.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{conversation.user.name}</h3>
          <p className="text-xs text-text-muted">{conversation.online ? <span className="text-success">● Online</span> : 'Offline'}</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted"><Phone size={16} /></button>
          <button className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted"><Video size={16} /></button>
          <button className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted"><MoreVertical size={16} /></button>
        </div>
      </div>
      {}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === myId;
            const isGroup = conversation.type === 'group';
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {isGroup && !isMe && (
                  <img src={msg.senderAvatar} alt="" className="w-8 h-8 rounded-full shrink-0 mt-auto mb-1 object-cover" />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {isGroup && !isMe && (
                    <span className="text-[10px] font-semibold text-text-muted ml-1 mb-1">{msg.senderName}</span>
                  )}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                    isMe ? 'gradient-primary text-white rounded-br-md' : 'bg-surface-light rounded-bl-md'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-text-muted'}`}>{msg.time}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
      {}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted"><Smile size={18} /></button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/30 transition-all placeholder-text-muted" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl gradient-primary text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-40">
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
