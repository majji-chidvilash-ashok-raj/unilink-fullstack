import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
const AuthContext = createContext();
export const formatImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path; 
  const filename = path.replace(/\\/g, '/').split('/').pop();
  const VITE_API = import.meta.env.VITE_API_URL;
  let baseUrl = 'http://localhost:5000';
  if (VITE_API && VITE_API.startsWith('http')) {
    baseUrl = VITE_API.split('/api')[0];
  } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    baseUrl = window.location.origin;
  }
  return `${baseUrl}/uploads/${filename}`;
};
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('unilink_token');
      if (token) {
        try {
          const { data } = await authService.getMe();
          setUser({
            ...data,
            avatar: formatImageUrl(data.profilePicture) || `https://ui-avatars.com/api/?name=${data.name || 'User'}&background=random`
          });
          setRole(data.role || 'student');
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Auth check failed", err);
          localStorage.removeItem('unilink_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);
  const login = (userData, token) => {
    localStorage.setItem('unilink_token', token);
    setUser({
      ...userData,
      avatar: formatImageUrl(userData.profilePicture) || `https://ui-avatars.com/api/?name=${userData.name || 'User'}&background=random`
    });
    setRole(userData.role || 'student');
    setIsAuthenticated(true);
  };
  const logout = () => {
    localStorage.removeItem('unilink_token');
    setIsAuthenticated(false);
    setUser(null);
    setRole('student');
  };
  const switchRole = () => {
    setRole(r => r === 'student' ? 'admin' : 'student');
  };
  const updateProfile = (updates) => {
    const formattedUpdates = { ...updates };
    if (updates.profilePicture) {
      formattedUpdates.avatar = formatImageUrl(updates.profilePicture);
    }
    setUser(prev => ({ ...prev, ...formattedUpdates }));
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout, switchRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
