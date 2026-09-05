import axios from 'axios';

// Get token helper
const getToken = () => localStorage.getItem('token');

const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
});

// Interceptor to add token
authAxios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

// --- API Calls ---

const getStoreManagers = () => {
    return authAxios.get('/api/admin/users/store-managers');
};

const deleteUser = (id) => {
    return authAxios.delete(`/api/admin/users/${id}`);
};

const UserService = {
    getStoreManagers,
    deleteUser
};

export default UserService;