import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Search, MessageSquare, User, Calendar,
  Users, TrendingUp, ChevronLeft, ChevronRight,
  MessageCircle, QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
export default function Sidebar() {
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Feed' },
    { path: '/explore', icon: Search, label: 'Explore' },
    { path: '/connections', icon: Users, label: 'Connections' },
    { path: '/groups', icon: MessageCircle, label: 'Groups' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/profile/0', icon: User, label: 'Profile' },
  ];
  const isActive = (path) => location.pathname === path;
  const trending = [
    { tag: '#Hackathon2026', posts: '2.4k' },
    { tag: '#AIResearch', posts: '1.8k' },
    { tag: '#CampusLife', posts: '1.2k' },
    { tag: '#StartupWeek', posts: '956' },
  ];
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="hidden lg:block shrink-0"
    >
      <div className="sticky top-20 space-y-4">
        {}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-surface-light transition-colors text-text-muted"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl bg-surface border border-border overflow-hidden"
            >
              <div className="h-16 gradient-primary opacity-80" />
              <div className="px-4 pb-4 -mt-7">
                <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name || 'Student'}&background=random`} className="w-14 h-14 rounded-full ring-4 ring-surface object-cover" alt="" />
                <h3 className="font-bold mt-2 text-sm">{currentUser?.name || 'Student'}</h3>
                <p className="text-xs text-text-muted">{currentUser?.course || 'Student'}</p>
                <p className="text-xs text-text-muted mt-0.5">{currentUser?.university || 'SRM University AP'}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                  <div className="text-center flex-1">
                    <p className="font-bold text-xs">{(currentUser?.connectionCount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted">Connections</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-bold text-xs">{(currentUser?.postCount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted">Posts</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {}
        <div className="rounded-2xl bg-surface border border-border p-2">
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary/15 text-primary-light'
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
        {}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-surface border border-border p-4"
            >
              <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-primary-light" />
                Trending
              </h3>
              <div className="space-y-3">
                {trending.map((item) => (
                  <div key={item.tag} className="group cursor-pointer">
                    <p className="text-sm font-medium text-primary-light group-hover:text-primary transition-colors">{item.tag}</p>
                    <p className="text-xs text-text-muted">{item.posts} posts</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
