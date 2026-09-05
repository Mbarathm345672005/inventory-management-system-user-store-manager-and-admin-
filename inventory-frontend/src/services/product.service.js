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

// --- API Calls ---

// Get all products (for both user and admin)
const getAllProducts = () => {
    return authAxios.get('/api/products');
};

// Create a new product (admin only)
const createProduct = (productData) => {
    return authAxios.post('/api/products', productData);
};

// Update a product (admin only)
const updateProduct = (id, productData) => {
    return authAxios.put(`/api/products/${id}`, productData);
};

// Delete a product (admin only)
const deleteProduct = (id) => {
    return authAxios.delete(`/api/products/${id}`);
};

// Get a single product by its ID
const getProductById = (id) => {
    return authAxios.get(`/api/products/${id}`);
};

// Add an item to the user's cart
const addToCart = (productId, quantity) => {
    return authAxios.post('/api/user/cart', { productId, quantity });
};

// Get all items from the user's cart
const getCart = () => {
    return authAxios.get('/api/user/cart');
};

// Remove an item from the cart
const removeFromCart = (productId) => {
    return authAxios.delete(`/api/user/cart/${productId}`);
};

const checkout = () => {
  // Calls POST /api/user/checkout
  return authAxios.post('/api/user/checkout', {});
};

// --- NEW FUNCTION ---
const getTopSelling = () => {
    return authAxios.get('/api/products/top-selling');
};

const getRestockSuggestions = () => {
    return authAxios.get('/api/restock/suggestions');
};

const createPO = (poData) => {
    return authAxios.post('/api/restock/create-po', poData);
};

const getAnalytics = () => {
    return authAxios.get('/api/analytics/summary');
};
const getPOHistory = () => {
    return authAxios.get('/api/restock/history');
};

const getTrends = (period = 'monthly') => {
    return authAxios.get(`/api/analytics/trends?period=${period}`);
};

const downloadReport = () => {
return authAxios.get('/api/products/analytics/export', {
            responseType: 'blob', // Important for file download
    });
};

// --- MAKE SURE THE EXPORT OBJECT INCLUDES EVERYTHING ---
const ProductService = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    addToCart,
    getCart,
    removeFromCart,
    checkout,
    getTopSelling ,// <-- THE FIX IS ADDING IT HERE
    getRestockSuggestions,
    createPO,
    getAnalytics,
     getPOHistory ,
     getTrends,
    downloadReport
};

export default ProductService;