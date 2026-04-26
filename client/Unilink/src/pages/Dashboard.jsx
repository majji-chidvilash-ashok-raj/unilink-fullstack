import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Calendar } from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import PostCard from '../components/PostCard/PostCard';
import CreatePost from '../components/CreatePost/CreatePost';
import GlowCard from '../components/GlowCard/GlowCard';
import PageTransition, { fadeUp, staggerContainer } from '../components/PageTransition/PageTransition';
import { postService, connectionService, eventService } from '../services';
import { formatImageUrl } from '../context/AuthContext';
export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await postService.getFeed();
        const formattedPosts = data.map(post => ({
          id: post._id,
          user: {
            id: post.userId?._id,
            name: post.userId?.name || 'Unknown User',
            avatar: post.userId?.profilePicture || `https://ui-avatars.com/api/?name=${post.userId?.name || 'User'}&background=random`,
            course: 'Student', 
          },
          content: post.content,
          image: post.image,
          likes: post.likes?.length || 0,
          liked: false, 
          comments: post.comments?.map(c => ({
            id: c._id,
            text: c.text,
            user: {
              id: c.userId?._id,
              name: c.userId?.name || 'Unknown User',
              avatar: c.userId?.profilePicture || `https://ui-avatars.com/api/?name=${c.userId?.name || 'User'}&background=random`,
            },
            time: new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })) || [],
          shares: 0,
          time: new Date(post.createdAt).toLocaleDateString()
        }));
        setPosts(formattedPosts);
        try {
          const discRes = await connectionService.discoverUsers();
          setSuggestions((discRes.data || []).slice(0, 3).map(u => ({
            id: u._id,
            name: u.name,
            university: u.university || 'SRM University AP',
            avatar: formatImageUrl(u.profilePicture) || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`
          })));
        } catch (e) {  }
        try {
          const evRes = await eventService.getEvents();
          setUpcomingEvents((evRes.data || []).slice(0, 2).map(ev => ({
            id: ev._id,
            title: ev.eventName,
            date: new Date(ev.date).toLocaleDateString(),
            image: formatImageUrl(ev.image) || `https://picsum.photos/seed/${ev._id}/300/200`
          })));
        } catch (e) {  }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);
  const handleNewPost = (newPost) => setPosts([newPost, ...posts]);
  const handleDelete = async (id) => {
    try {
      await postService.deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };
  const overviewCards = [
    { label: 'Total Posts', value: posts.length.toString(), icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { label: 'Connections', value: suggestions.length.toString(), icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Events', value: upcomingEvents.length.toString(), icon: Calendar, color: 'from-amber-500 to-orange-500' },
  ];
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="flex gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">
            {}
            <motion.div variants={staggerContainer} initial="initial" animate="animate"
              className="grid grid-cols-3 gap-4 mb-6">
              {overviewCards.map((card) => (
                <motion.div key={card.label} variants={fadeUp}>
                  <GlowCard className="rounded-2xl">
                    <div className="rounded-2xl bg-surface border border-border p-4 hover-lift cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-text-muted">{card.label}</p>
                          <p className="text-2xl font-bold mt-1 font-display">{card.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <card.icon size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </motion.div>
            <h2 className="text-lg font-semibold mb-4 font-display">Feed</h2>
            <CreatePost onPost={handleNewPost} />
            <div className="mt-4 space-y-4">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <PostCard post={post} onDelete={handleDelete} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center p-8 text-text-muted bg-surface rounded-2xl border border-border">
                  No posts yet. Be the first to share something!
                </div>
              )}
            </div>
          </main>
          {}
          <aside className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-20 space-y-5">
              <div className="rounded-2xl bg-surface border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Suggested</h3>
                  <Link to="/explore" className="text-xs text-primary hover:underline">See all</Link>
                </div>
                <div className="space-y-3">
                  {suggestions.length > 0 ? suggestions.map((user) => (
                    <SuggestionItem key={user.id} user={user} />
                  )) : (
                    <p className="text-xs text-text-muted">No suggestions yet</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl bg-surface border border-border p-4">
                <h3 className="text-sm font-semibold mb-3">Upcoming Events</h3>
                <div className="space-y-3">
                  {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                    <Link key={event.id} to={`/events/${event.id}`} className="flex gap-2.5 group">
                      <img src={event.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary-light transition-colors">{event.title}</p>
                        <p className="text-xs text-text-muted">{event.date}</p>
                      </div>
                    </Link>
                  )) : (
                    <p className="text-xs text-text-muted">No events yet</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
function SuggestionItem({ user }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="flex items-center gap-2.5">
      <Link to={`/profile/${user.id}`}><img src={user.avatar} alt="" className="w-9 h-9 rounded-full" /></Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.id}`} className="text-sm font-medium truncate block hover:underline">{user.name}</Link>
        <p className="text-xs text-text-muted truncate">{user.university}</p>
      </div>
      <button onClick={() => setFollowing(!following)}
        className={`text-xs font-semibold transition-colors ${following ? 'text-text-muted' : 'text-primary hover:text-primary-dark'}`}>
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
