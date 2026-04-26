import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, BookOpen, Calendar, Edit3, UserPlus, UserCheck, MessageSquare, Grid, Bookmark, Loader2 } from 'lucide-react';
import PostCard from '../components/PostCard/PostCard';
import PageTransition, { fadeUp } from '../components/PageTransition/PageTransition';
import { useAuth, formatImageUrl } from '../context/AuthContext';
import { userService, postService, connectionService } from '../services';
export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const isOwn = id === '0' || id === currentUser?._id || id === currentUser?.id;
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (isOwn) {
          const { data } = await userService.getProfile();
          setProfileUser({
            ...data,
            avatar: formatImageUrl(data.profilePicture) || `https://ui-avatars.com/api/?name=${data.name || 'User'}&background=random`
          });
          const postsRes = await userService.getMyPosts();
          const formatted = (postsRes.data || []).map(post => ({
            id: post._id,
            user: {
              id: data._id,
              name: data.name,
              avatar: data.profilePicture, 
              course: 'Student',
            },
            content: post.content,
            image: post.image,
            likes: post.likes?.length || 0,
            liked: post.likes?.includes(currentUser?._id || currentUser?.id),
            comments: (post.comments || []).map(c => ({
              id: c._id,
              text: c.text,
              user: { 
                id: c.userId?._id, 
                name: c.userId?.name || 'User', 
                avatar: formatImageUrl(c.userId?.profilePicture) || `https://ui-avatars.com/api/?name=${c.userId?.name || 'User'}&background=random`
              },
              time: new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })),
            shares: 0,
            time: new Date(post.createdAt).toLocaleDateString(),
          }));
          setUserPosts(formatted);
        } else {
          const { data: otherUser } = await userService.getUserProfile(id);
          setProfileUser({
            ...otherUser,
            avatar: formatImageUrl(otherUser.profilePicture) || `https://ui-avatars.com/api/?name=${otherUser.name || 'User'}&background=random`
          });
          const postsRes = await userService.getUserPosts(id);
          const formatted = (postsRes.data || []).map(post => ({
            id: post._id,
            user: {
              id: otherUser._id,
              name: otherUser.name,
              avatar: otherUser.profilePicture,
              course: 'Student',
            },
            content: post.content,
            image: post.image,
            likes: post.likes?.length || 0,
            liked: post.likes?.includes(currentUser?._id || currentUser?.id),
            comments: (post.comments || []).map(c => ({
              id: c._id,
              text: c.text,
              user: { 
                id: c.userId?._id, 
                name: c.userId?.name || 'User', 
                avatar: formatImageUrl(c.userId?.profilePicture) || `https://ui-avatars.com/api/?name=${c.userId?.name || 'User'}&background=random`
              },
              time: new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })),
            shares: 0,
            time: new Date(post.createdAt).toLocaleDateString(),
          }));
          setUserPosts(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwn]);
  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-10 flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }
  const user = profileUser || currentUser;
  const handleConnect = async () => {
    try {
      await connectionService.sendRequest(id);
      setConnected(true);
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        {}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden">
          <div className="h-48 sm:h-64 gradient-primary opacity-80 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
          </div>
        </motion.div>
        {}
        <div className="relative px-4 sm:px-6 -mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
              src={user?.avatar || formatImageUrl(user?.profilePicture) || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
              className="w-28 h-28 rounded-2xl ring-4 ring-bg shadow-xl bg-surface object-cover" />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold font-display">{user?.name || 'User'}</h1>
                  <p className="text-sm text-text-muted">@{(user?.name || 'user').toLowerCase().replace(/\s+/g, '')}</p>
                </div>
                <div className="flex gap-2 sm:ml-auto">
                  {isOwn ? (
                    <Link to="/edit-profile"
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-surface border border-border text-sm font-medium hover:bg-surface-light transition-colors">
                      <Edit3 size={14} /> Edit Profile
                    </Link>
                  ) : (
                    <>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={handleConnect}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                          connected ? 'bg-surface border border-border text-text-muted' : 'gradient-primary text-white shadow-lg hover:opacity-90'
                        }`}>
                        {connected ? <><UserCheck size={14} /> Requested</> : <><UserPlus size={14} /> Connect</>}
                      </motion.button>
                      <Link to="/messages" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-sm font-medium hover:bg-surface-light transition-colors">
                        <MessageSquare size={14} />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm leading-relaxed">{user?.bio || 'No bio yet.'}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-muted">
              <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-primary-light" /> {user?.role || 'Student'}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary-light" /> {user?.university || 'SRM University AP'}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary-light" /> Joined {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-5">
            <div className="cursor-pointer hover:text-primary-light transition-colors">
              <span className="font-bold">{user?.connectionCount || user?.connections?.length || 0}</span> <span className="text-text-muted text-sm">Connections</span>
            </div>
            <div className="cursor-pointer hover:text-primary-light transition-colors">
              <span className="font-bold">{user?.postCount || userPosts.length || 0}</span> <span className="text-text-muted text-sm">Posts</span>
            </div>
          </div>
        </div>
        {}
        <div className="mt-8 border-b border-border">
          <div className="flex gap-1">
            {[{ key: 'posts', icon: Grid, label: 'Posts' }, { key: 'saved', icon: Bookmark, label: 'Saved' }].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.key ? 'border-primary text-primary-light' : 'border-transparent text-text-muted hover:text-text'
                }`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-5">
          {activeTab === 'posts' ? (
            userPosts.length > 0 ? userPosts.map((post) => <PostCard key={post.id} post={post} />) : (
              <div className="text-center py-16"><p className="text-text-muted">No posts yet</p></div>
            )
          ) : (
            <div className="text-center py-16">
              <Bookmark size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-text-muted">No saved posts</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
