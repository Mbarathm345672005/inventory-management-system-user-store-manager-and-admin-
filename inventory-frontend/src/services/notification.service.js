import axios from 'axios';

const getToken = () => localStorage.getItem('token');
const authAxios = axios.create();
authAxios.interceptors.request.use(config => {
    config.headers['Authorization'] = `Bearer ${getToken()}`;
    return config;
});

const getAllNotifications = () => authAxios.get('/api/notifications');
const getUnreadCount = () => authAxios.get('/api/notifications/unread-count');
const markAsRead = (id) => authAxios.put(`/api/notifications/${id}/read`);

export default { getAllNotifications, getUnreadCount, markAsRead };