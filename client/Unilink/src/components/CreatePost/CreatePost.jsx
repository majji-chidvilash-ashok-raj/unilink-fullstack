import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Send, Smile, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services';
import { useToast } from '../Toast/Toast';
export default function CreatePost({ onPost }) {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Please select an image file', 'error');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }
      const { data } = await postService.createPost(formData);
      const newPost = {
        id: data._id,
        user: {
          id: data.userId?._id,
          name: data.userId?.name || currentUser.name,
          avatar: data.userId?.profilePicture || currentUser.avatar,
          course: 'Student',
        },
        content: data.content,
        image: data.image,
        likes: data.likes?.length || 0,
        liked: false,
        comments: data.comments?.map(c => ({
          id: c._id,
          text: c.text,
          user: {
            id: c.userId?._id,
            name: c.userId?.name || 'User',
            avatar: c.userId?.profilePicture || `https://ui-avatars.com/api/?name=${c.userId?.name || 'User'}&background=random`
          }
        })) || [],
        shares: 0,
        time: 'Just now'
      };
      onPost?.(newPost);
      setContent('');
      removeImage();
      setFocused(false);
      addToast('Post created successfully!', 'success');
    } catch (err) {
      console.error("Failed to create post", err);
      addToast('Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="rounded-2xl bg-surface border border-border p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`} className="w-10 h-10 rounded-xl object-cover" alt="" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Share something with the community..."
            rows={focused || preview ? 3 : 1}
            className="w-full bg-transparent text-sm outline-none resize-none placeholder-text-muted transition-all py-2"
          />
          <AnimatePresence>
            {preview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mt-2 mb-4 rounded-xl overflow-hidden border border-border group"
              >
                <img src={preview} alt="Preview" className="w-full h-auto max-h-80 object-cover" />
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {(focused || preview) && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between pt-2 border-t border-border mt-2">
              <div className="flex gap-1">
                <button 
                  onClick={handleImageClick}
                  className={`p-2 rounded-lg transition-colors ${preview ? 'text-primary bg-primary/10' : 'text-text-muted hover:bg-surface-light'}`}
                  title="Add Image"
                >
                  <Image size={18} />
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted"><Smile size={18} /></button>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }} 
                onClick={handleSubmit} 
                disabled={(!content.trim() && !image) || loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Post</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
