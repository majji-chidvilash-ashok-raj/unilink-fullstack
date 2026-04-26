import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, GraduationCap, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground/ParticleBackground';
import { useToast } from '../components/Toast/Toast';
import { authService } from '../services';
export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
        addToast('Invalid reset link', 'error');
        navigate('/forgot-password');
    }
  }, [location, navigate, addToast]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    setLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      addToast('Password reset successful! Please login.', 'success');
      navigate('/login');
    } catch (err) {
      console.error("Reset password failed", err);
      addToast(err.response?.data?.msg || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };
  const inputClass = "w-full bg-surface-light/50 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all placeholder-text-muted/50";
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      {}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4">
        {}
        <div className="text-center mb-10">
          <motion.div whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-xl glow-sm">
            <GraduationCap size={28} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black font-display tracking-tight">Reset Password</h1>
          <p className="text-sm text-text-muted mt-2">Enter the OTP sent to {email}</p>
        </div>
        {}
        <div className="rounded-3xl glass-card p-8 glow-ambient">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">OTP Code</label>
              <div className="relative">
                <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50" />
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP"
                  className={inputClass} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50" />
                <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••" className={inputClass} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-text transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50" />
                <input type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" className={inputClass} required />
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl gradient-primary text-white font-semibold shadow-xl glow hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Resetting...</> : <>Reset Password <ArrowRight size={18} /></>}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
