import axios from 'axios';

// Get the token from localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Create an 'axios' instance with the auth header
// This ensures all requests from this service are authenticated
const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
});

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

/**
 * Calls the backend to get the full forecast for all products.
 * The backend will, in turn, call the Python AI service.
 */
const getFullForecast = () => {
    return authAxios.get('/api/forecast');
};
const downloadForecastReport = () => {
    return authAxios.get('/api/forecast/export', {
        responseType: 'blob',
    });
};

const ForecastService = {
    getFullForecast,
    downloadForecastReport
};

export default ForecastService;