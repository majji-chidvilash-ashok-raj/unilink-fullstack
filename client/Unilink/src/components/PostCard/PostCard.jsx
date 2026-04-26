import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Send } from 'lucide-react';
import { useToast } from '../Toast/Toast';
import { postService } from '../../services';
import { useAuth, formatImageUrl } from '../../context/AuthContext';
export default function PostCard({ post, onDelete }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [comment, setComment] = useState('');
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const [commenting, setCommenting] = useState(false);
  const [localComments, setLocalComments] = useState(post.comments || []);
  const handleLike = async () => {
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      setLikes(newLiked ? likes + 1 : likes - 1);
      if (newLiked) addToast(`You liked ${post.user.name}'s post`, 'like');
      await postService.likePost(post.id);
    } catch (err) {
      console.error("Failed to like post", err);
      setLiked(!liked);
      setLikes(liked ? likes + 1 : likes - 1);
    }
  };
  const handleComment = async () => {
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      await postService.commentPost(post.id, { text: comment });
      const newComment = {
        id: `c${Date.now()}`,
        text: comment,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        time: 'Just now'
      };
      setLocalComments([...localComments, newComment]);
      setComment('');
    } catch (err) {
      console.error("Failed to add comment", err);
      addToast('Failed to add comment', 'error');
    } finally {
      setCommenting(false);
    }
  };
  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/10 transition-colors">
      {}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <Link to={`/profile/${post.user.id}`} className="flex items-center gap-3 group">
          <img src={formatImageUrl(post.user.avatar) || `https://ui-avatars.com/api/?name=${post.user.name || 'User'}&background=random`} className="w-9 h-9 rounded-full object-cover border border-border" alt="" />
          <div>
            <h3 className="text-sm font-semibold group-hover:text-primary-light transition-colors">{post.user.name}</h3>
            <p className="text-xs text-text-muted">{post.user.course} · {post.time}</p>
          </div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted">
            <MoreHorizontal size={18} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-40 glass-card rounded-xl shadow-2xl z-40 p-1 overflow-hidden">
                  <button onClick={() => { onDelete?.(post.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      {}
      <div className="px-5 py-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>
      {}
      {post.image && (
        <div className="px-3 pb-2">
          <img 
            src={formatImageUrl(post.image)} 
            alt="Post content" 
            className="w-full rounded-xl object-cover max-h-[450px] shadow-sm border border-border/50" 
          />
        </div>
      )}
      {}
      <div className="px-5 py-3 flex items-center gap-1 border-t border-border mt-1">
        <motion.button whileTap={{ scale: 0.85 }} onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${liked ? 'text-rose-400 bg-rose-400/10' : 'text-text-muted hover:bg-surface-light'}`}>
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span className="text-xs font-medium">{likes}</span>
        </motion.button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-muted hover:bg-surface-light transition-colors">
          <MessageCircle size={16} />
          <span className="text-xs font-medium">{localComments.length}</span>
        </button>
        <div className="flex-1" />
      </div>
      {}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden">
            <div className="p-4 space-y-3">
              {localComments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <img src={c.user.avatar} alt="" className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 bg-surface-light rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{c.user.name}</span>
                      <span className="text-[10px] text-text-muted">{c.time}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="Write a comment..."
                  className="flex-1 glass-input rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/30 placeholder-text-muted" disabled={commenting} />
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleComment} disabled={commenting || !comment.trim()} className="p-2 rounded-xl gradient-primary text-white shadow-sm disabled:opacity-50">
                  <Send size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
