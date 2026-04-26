import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, GraduationCap, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground/ParticleBackground';
import { useToast } from '../components/Toast/Toast';
import { authService } from '../services';
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      addToast('OTP sent to your email', 'success');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("Forgot password request failed", err);
      addToast(err.response?.data?.msg || 'Request failed', 'error');
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
          <h1 className="text-3xl font-black font-display tracking-tight">Forgot Password</h1>
          <p className="text-sm text-text-muted mt-2">Enter your email to receive a reset OTP</p>
        </div>
        {}
        <div className="rounded-3xl glass-card p-8 glow-ambient">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu"
                  className={inputClass} required />
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl gradient-primary text-white font-semibold shadow-xl glow hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send Reset OTP <ArrowRight size={18} /></>}
            </motion.button>
          </form>
          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link to="/login" className="text-sm text-text-muted hover:text-primary-light flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
