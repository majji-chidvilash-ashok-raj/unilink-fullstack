import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Calendar, Flag, TrendingUp, UserPlus, Activity, MessageSquare } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../components/PageTransition/PageTransition';
import { adminService } from '../../services';
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const formatTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000); 
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return past.toLocaleDateString();
  };
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminService.getStats();
        setStats({
          totalUsers: data.counts?.users || 0,
          totalPosts: data.counts?.posts || 0,
          totalEvents: data.counts?.events || 0,
          totalGroups: data.counts?.groups || 0,
          newSignups: data.recentUsers?.length || 0,
          activeUsers: (data.counts?.users || 0) - (data.counts?.banned || 0),
          reportsToday: 0,
          revenue: '$0',
          userGrowth: data.userGrowth || [0, 0, 0, 0, 0, 0, 0],
          recentActivity: data.recentActivity || []
        });
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  if (loading || !stats) {
    return <div className="p-6 max-w-7xl mx-auto flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }
  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: 'Total Posts', value: stats.totalPosts.toLocaleString(), icon: FileText, color: 'from-purple-500 to-pink-500', change: '+8%' },
    { label: 'Active Events', value: stats.totalEvents, icon: Calendar, color: 'from-amber-500 to-orange-500', change: '+5' },
    { label: 'New Signups', value: stats.newSignups, icon: UserPlus, color: 'from-emerald-500 to-teal-500', change: '+24%' },
  ];
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Overview of your platform</p>
      </div>
      {}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <motion.div key={card.label} variants={fadeUp}
            className="rounded-2xl bg-surface border border-border p-5 hover-lift cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon size={20} className="text-white" />
              </div>
              <span className="text-xs text-success font-semibold">{card.change}</span>
            </div>
            <p className="text-2xl font-bold font-display">{card.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>
      <div className="grid lg:grid-cols-3 gap-6">
        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-surface border border-border p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity size={16} className="text-primary-light" /> User Growth (7 Days)
            </h3>
            <span className="text-xs text-text-muted">Total: {stats.userGrowth.reduce((a, b) => a + b, 0)} new users</span>
          </div>
          <div className="flex items-end gap-2 h-48 px-2">
            {stats.userGrowth.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(v / (Math.max(...stats.userGrowth, 5))) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="flex-1 rounded-t-lg gradient-primary opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-surface border border-border text-xs font-bold opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl z-10">
                  {v}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-text-muted uppercase font-bold tracking-wider px-1">
            {['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'].map(d => <span key={d}>{d}</span>)}
          </div>
        </motion.div>
        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-surface border border-border p-5">
          <h3 className="font-semibold mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50 border border-border">
              <span className="text-sm text-text-muted">Active Users</span>
              <span className="font-bold text-sm">{stats.activeUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50 border border-border">
              <span className="text-sm text-text-muted">Reports Today</span>
              <span className="font-bold text-sm text-danger">{stats.reportsToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50 border border-border">
              <span className="text-sm text-text-muted">Total Groups</span>
              <span className="font-bold text-sm">{stats.totalGroups}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50 border border-border">
              <span className="text-sm text-text-muted">Revenue</span>
              <span className="font-bold text-sm text-success">{stats.revenue}</span>
            </div>
          </div>
        </motion.div>
      </div>
      {}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-6 rounded-2xl bg-surface border border-border p-5">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary-light" /> Live Platform Activity
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {stats.recentActivity.length > 0 ? stats.recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-light/30 border border-border/50 hover:border-primary/30 transition-all group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                a.type === 'post' ? 'bg-purple-500/15 text-purple-400' : 
                a.type === 'event' ? 'bg-amber-500/15 text-amber-400' : 
                'bg-blue-500/15 text-blue-400'
              }`}>
                {a.type === 'post' ? <MessageSquare size={16} /> : 
                 a.type === 'event' ? <Calendar size={16} /> : 
                 <UserPlus size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold group-hover:text-primary-light transition-colors">{a.action}</p>
                <p className="text-xs text-text-muted truncate">{a.detail}</p>
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase shrink-0 bg-surface-light px-2 py-1 rounded-md">{formatTime(a.time)}</span>
            </div>
          )) : (
            <div className="col-span-2 text-center py-10 text-text-muted text-sm italic">No recent activity recorded</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
