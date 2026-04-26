import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MoreHorizontal, Shield, Ban, Eye, ChevronDown } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../components/PageTransition/PageTransition';
import { adminService } from '../../services';
import { useToast } from '../../components/Toast/Toast';
export default function AdminUsers() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fetchUsers = async () => {
    try {
      const { data } = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleBan = async (id, currentStatus) => {
    try {
      await adminService.banUser(id);
      addToast(currentStatus ? 'User unbanned' : 'User banned', 'success');
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle ban status", err);
      addToast('Action failed', 'error');
    }
  };
  const handleRole = async (id, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'student' : 'admin';
      await adminService.updateUserRole(id, { role: newRole });
      addToast(`User role updated to ${newRole}`, 'success');
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role", err);
      addToast('Action failed', 'error');
    }
  };
  const filtered = users.filter(u => !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">User Management</h1>
        <p className="text-sm text-text-muted mt-1">Manage platform users</p>
      </div>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users by name or email..."
          className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/40 placeholder-text-muted" />
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase hidden md:table-cell">University</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase hidden lg:table-cell">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></td></tr>
              ) : filtered.map((user, i) => (
                <motion.tr key={user._id || user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-surface-light/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={user.profilePicture || user.avatar || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <div>
                        <Link to={`/profile/${user._id || user.id}`} className="text-sm font-medium hover:text-primary-light transition-colors">{user.name}</Link>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-text-muted hidden md:table-cell">{user.university || 'SRM University AP'}</td>
                  <td className="px-5 py-3 text-sm text-text-muted hidden lg:table-cell">{user.course || 'N/A'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isBanned ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                    {user.role === 'admin' && <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary-light">Admin</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => navigate(`/profile/${user._id || user.id}`)}
                        className="p-1.5 rounded-lg hover:bg-surface-light transition-colors text-text-muted" 
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleRole(user._id || user.id, user.role)} className={`p-1.5 rounded-lg transition-colors ${user.role === 'admin' ? 'text-primary-light bg-primary/10' : 'hover:bg-primary/10 text-text-muted hover:text-primary-light'}`} title={user.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}>
                        <Shield size={14} />
                      </button>
                      <button onClick={() => handleBan(user._id || user.id, user.isBanned)} className={`p-1.5 rounded-lg transition-colors ${user.isBanned ? 'text-danger bg-danger/10' : 'hover:bg-danger/10 text-text-muted hover:text-danger'}`} title={user.isBanned ? 'Unban' : 'Ban'}>
                        <Ban size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
