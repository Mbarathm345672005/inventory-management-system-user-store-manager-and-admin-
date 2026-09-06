import axios from 'axios';

const getToken = () => localStorage.getItem('token');
const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
});
authAxios.interceptors.request.use(config => {
    config.headers['Authorization'] = `Bearer ${getToken()}`;
    return config;
});

const getAllNotifications = () => authAxios.get('/api/notifications');
const getUnreadCount = () => authAxios.get('/api/notifications/unread-count');
const markAsRead = (id) => authAxios.put(`/api/notifications/${id}/read`);

const NotificationService = { getAllNotifications, getUnreadCount, markAsRead };
export default NotificationService;