import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Calendar, Shield,
  ChevronLeft, ChevronRight, BarChart3, Settings, LogOut, GraduationCap, MessageSquare, Bell
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/posts', icon: FileText, label: 'Posts' },
    { path: '/admin/groups', icon: MessageSquare, label: 'Groups' },
    { path: '/admin/events', icon: Calendar, label: 'Events' },
  ];
  const isActive = (path) => location.pathname === path;
  return (
    <div className="min-h-screen bg-bg flex">
      {}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="fixed left-0 top-0 bottom-0 bg-surface border-r border-border z-50 flex flex-col"
      >
        {}
        <div className="h-16 flex items-center px-4 border-b border-border gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <span className="text-lg font-bold gradient-text font-display">UniLink</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Admin</span>
            </motion.div>
          )}
        </div>
        {}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-primary/15 text-primary-light'
                  : 'text-text-muted hover:text-text hover:bg-surface-light'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        {}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 w-full transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:bg-surface-light w-full transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>
      <div className="flex-1 flex flex-col min-h-screen">
        <motion.header
          animate={{ left: collapsed ? 72 : 260 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="fixed top-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-muted">UniLink Control Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-8 w-[1px] bg-border mx-1" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-text-muted uppercase font-bold mt-1 tracking-wider">System Administrator</p>
              </div>
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`}
                className="w-9 h-9 rounded-full border-2 border-primary/20 p-0.5" 
                alt="Admin" 
              />
            </div>
          </div>
        </motion.header>
        <motion.main
          animate={{ marginLeft: collapsed ? 72 : 260 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 pt-16"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
