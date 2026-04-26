import api from './api';
export const authService = {
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  signup: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/users/profile'),
};
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateProfilePicture: (formData) => api.put('/users/profile/picture', formData),
  getMyPosts: () => api.get('/users/posts'),
  getUserProfile: (id) => api.get(`/users/${id}`),
  getUserPosts: (id) => api.get(`/users/${id}/posts`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
};
export const postService = {
  getFeed: () => api.get('/posts'),
  createPost: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/posts', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  },
  likePost: (id) => api.put(`/posts/like/${id}`),
  commentPost: (id, data) => api.post(`/posts/comment/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
};
export const connectionService = {
  getConnections: () => api.get('/connections'),
  getPendingRequests: () => api.get('/connections/requests'),
  discoverUsers: () => api.get('/connections/discover'),
  sendRequest: (userId) => api.post(`/connections/send/${userId}`),
  acceptRequest: (userId) => api.post(`/connections/accept/${userId}`),
  declineRequest: (userId) => api.post(`/connections/decline/${userId}`),
};
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getDirectMessages: (userId) => api.get(`/chat/direct/${userId}`),
  sendDirectMessage: (userId, data) => api.post(`/chat/direct/${userId}`, data),
  getGroupMessages: (groupId) => api.get(`/chat/group/${groupId}`),
  sendGroupMessage: (groupId, data) => api.post(`/chat/group/${groupId}`, data),
};
export const eventService = {
  getEvents: () => api.get('/events'),
  joinEvent: (id) => api.put(`/events/join/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getParticipants: (id) => api.get(`/events/${id}/participants`),
};
export const groupService = {
  getGroups: () => api.get('/groups'),
  createGroup: (data) => api.post('/groups', data),
  joinGroup: (id) => api.put(`/groups/join/${id}`),
  addMember: (groupId, userId) => api.put(`/groups/add/${groupId}/${userId}`),
  removeMember: (groupId, userId) => api.put(`/groups/remove/${groupId}/${userId}`),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
};
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  banUser: (userId) => api.put(`/admin/ban/${userId}`),
  updateUserRole: (userId, data) => api.put(`/admin/role/${userId}`, data),
};
