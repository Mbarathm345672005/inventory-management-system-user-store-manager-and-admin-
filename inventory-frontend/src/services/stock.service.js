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

const stockIn = (productId, quantity) => {
    return authAxios.post('/api/stock/in', { productId, quantity });
};

const stockOut = (productId, quantity) => {
    return authAxios.post('/api/stock/out', { productId, quantity });
};

const getHistory = () => {
    return authAxios.get('/api/stock/history');
};

const StockService = {
    stockIn,
    stockOut,
    getHistory
};

export default StockService;