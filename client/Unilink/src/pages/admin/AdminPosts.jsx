import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Flag, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { fadeUp } from '../../components/PageTransition/PageTransition';
import { postService } from '../../services';
import { formatImageUrl } from '../../context/AuthContext';
export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await postService.getFeed();
        const formatted = (data || []).map(post => ({
          id: post._id,
          user: {
            name: post.userId?.name || 'Unknown',
            avatar: post.userId?.profilePicture || `https://ui-avatars.com/api/?name=${post.userId?.name || 'User'}&background=random`
          },
          content: post.content,
          image: post.image,
          likes: post.likes?.length || 0,
          comments: post.comments || [],
          shares: 0,
          time: new Date(post.createdAt).toLocaleDateString(),
        }));
        setPosts(formatted);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);
  const filtered = posts.filter(p => !query || p.content.toLowerCase().includes(query.toLowerCase()) || p.user.name.toLowerCase().includes(query.toLowerCase()));
  const handleRemove = async (id) => {
    try {
      await postService.deletePost(id);
      setPosts(ps => ps.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Post Moderation</h1>
        <p className="text-sm text-text-muted mt-1">Review and moderate user posts</p>
      </div>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search posts..."
          className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/40 placeholder-text-muted" />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post, i) => (
            <motion.div key={post.id} variants={fadeUp} initial="initial" animate="animate" transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-surface border border-border p-5 hover:border-primary/20 transition-all">
              <div className="flex items-start gap-4">
                <img src={formatImageUrl(post.user.avatar) || `https://ui-avatars.com/api/?name=${post.user.name || 'User'}&background=random`} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{post.user.name}</p>
                    <span className="text-xs text-text-muted">· {post.time}</span>
                  </div>
                  <p className="text-sm text-text-muted mb-3">{post.content}</p>
                  {post.image && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-border/50 max-w-md">
                      <img 
                        src={formatImageUrl(post.image)} 
                        alt="Post content" 
                        className="w-full h-auto object-cover max-h-60" 
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">❤️ {post.likes}</span>
                    <span className="flex items-center gap-1">💬 {post.comments.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-2 rounded-lg hover:bg-success/10 transition-colors text-text-muted hover:text-success" title="Approve">
                    <CheckCircle size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors text-text-muted hover:text-amber-400" title="Flag">
                    <Flag size={16} />
                  </button>
                  <button onClick={() => handleRemove(post.id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-text-muted hover:text-danger" title="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">No posts found</div>
          )}
        </div>
      )}
    </div>
  );
}
