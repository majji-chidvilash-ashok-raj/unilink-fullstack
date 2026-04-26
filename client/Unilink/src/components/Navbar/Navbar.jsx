import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Search, MessageSquare, User, LogOut, Menu, X,
  GraduationCap, Plus, Shield, Settings, Briefcase, Users, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const studentNav = [
    { path: '/dashboard', icon: Home, label: 'Feed' },
    { path: '/explore', icon: Search, label: 'Explore' },
    { path: '/messages', icon: MessageSquare, label: 'Messages', badge: 3 },
  ];
  const adminNav = [
    { path: '/admin', icon: Home, label: 'Overview' },
    { path: '/admin/users', icon: User, label: 'Users' },
    { path: '/admin/posts', icon: MessageSquare, label: 'Posts' },
    { path: '/admin/groups', icon: Users, label: 'Groups' },
    { path: '/admin/events', icon: Calendar, label: 'Events' },
  ];
  const navItems = role === 'admin' ? adminNav : studentNav;
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotateY: 15 }}
              className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg"
            >
              <GraduationCap size={20} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold gradient-text hidden sm:block font-display">UniLink</span>
            {role === 'admin' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Admin</span>
            )}
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary/15 text-primary-light'
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-xs flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {role === 'student' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
              >
                <Plus size={16} />
                <span>Post</span>
              </motion.button>
            )}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-light transition-colors"
              >
                <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`} className="w-8 h-8 rounded-lg object-cover border border-border" alt="" />
                <span className="hidden lg:block text-sm font-medium">{(currentUser?.name || 'User').split(' ')[0]}</span>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                          <div>
                            <p className="font-semibold text-sm">{currentUser?.name || 'User'}</p>
                            <p className="text-xs text-text-muted">@{(currentUser?.name || 'user').toLowerCase().replace(/\s+/g, '')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link to={`/profile/${currentUser?._id || currentUser?.id}`} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-surface-light transition-colors">
                          <User size={16} className="text-text-muted" /> My Profile
                        </Link>
                        <hr className="border-border my-1" />
                        <button onClick={() => { logout(); navigate('/'); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors text-left">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-surface-light transition-colors">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-surface overflow-hidden"
          >
            <div className="p-3 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path) ? 'bg-primary/15 text-primary-light' : 'text-text-muted hover:text-text hover:bg-surface-light'
                  }`}>
                  <item.icon size={18} /> <span>{item.label}</span>
                  {item.badge && <span className="ml-auto px-2 py-0.5 rounded-full bg-danger text-white text-xs font-semibold">{item.badge}</span>}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
