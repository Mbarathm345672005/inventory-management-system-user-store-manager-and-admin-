// src/services/auth.service.js
import axios from 'axios';

// Get the token from localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Create an 'axios' instance with the auth header
const authAxios = axios.create();

authAxios.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Admin-Specific API Calls ---

// Get all users pending validation
const getPendingAdmins = () => {
    return authAxios.get('/api/admin/pending');
};

// Approve a user
const approveAdmin = (userId) => {
    return authAxios.post(`/api/admin/approve/${userId}`);
};

// Decline (delete) a user
const declineAdmin = (userId) => {
    return authAxios.delete(`/api/admin/decline/${userId}`);
};

const AdminService = {
    getPendingAdmins,
    approveAdmin,
    declineAdmin,
};

// Export the named object
export default AdminService;