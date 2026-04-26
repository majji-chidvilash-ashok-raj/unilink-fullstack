import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, Building, FileText, Camera, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition/PageTransition';
import { useAuth, formatImageUrl } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import { userService } from '../services';
export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    course: user?.course || '', 
    university: user?.university || 'SRM University AP', 
    bio: user?.bio || '',
  });
  const currentAvatar = previewAvatar || user?.avatar || formatImageUrl(user?.profilePicture) || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      addToast('Only image files (JPG, PNG, GIF, WebP) are allowed', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be under 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewAvatar(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const { data } = await userService.updateProfilePicture(formData);
      updateProfile(data);
      setPreviewAvatar(formatImageUrl(data.profilePicture));
      addToast('Profile photo updated!', 'success');
    } catch (err) {
      console.error("Failed to upload photo:", err);
      addToast('Failed to upload photo', 'error');
      setPreviewAvatar(null);
    } finally {
      setUploading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userService.updateProfile({
        name: form.name,
        university: form.university,
        bio: form.bio,
      });
      updateProfile(data);
      addToast('Profile updated successfully!', 'success');
      navigate('/profile/0');
    } catch (err) {
      console.error("Failed to update profile:", err);
      addToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };
  const inputClass = "w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors";
  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-surface border border-border overflow-hidden">
          <div className="relative h-32 gradient-primary opacity-80" />
          {}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="px-6 -mt-10 relative">
            <div className="relative inline-block group cursor-pointer" onClick={handleAvatarClick}>
              <img
                src={currentAvatar}
                alt={user?.name}
                className="w-20 h-20 rounded-2xl ring-4 ring-surface bg-surface object-cover"
              />
              {}
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploading ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </div>
              {}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full gradient-primary text-white shadow-lg">
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </div>
            </div>
            <p className="text-xs text-text-muted mt-2">Click the photo to change it (max 5MB)</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <h2 className="text-xl font-bold font-display">Edit Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} disabled />
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Course / Major</label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" name="course" value={form.course} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">University</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" name="university" value={form.university} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3 text-text-muted" />
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} maxLength={200}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors resize-none" />
                <span className="absolute bottom-2 right-3 text-xs text-text-muted">{form.bio.length}/200</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl bg-surface-light border border-border text-sm font-semibold hover:bg-surface-lighter transition-colors">
                Cancel
              </button>
              <motion.button type="submit" disabled={loading || uploading} whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
