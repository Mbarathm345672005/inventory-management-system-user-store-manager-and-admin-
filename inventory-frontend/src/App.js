import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Navbar as BootstrapNavbar, Nav, Button, Row, Col, Image } from 'react-bootstrap';
import 'animate.css';
import ManageStoreManagers from './pages/admin/ManageStoreManagers';

// --- Page Imports ---
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import UserDashboard from './pages/UserDashboard';
import CartPage from './pages/CartPage';
import ProtectedRoute from './pages/ProtectedRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForecastingPage from './pages/ForecastingPage';
import RestockPage from './pages/RestockPage';
import './App.css';
import AlertsPage from './pages/AlertsPage';
// --- Admin Component Imports ---
import AdminLayout from './components/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import ManageProducts from './pages/admin/ManageProducts';
import PendingApprovals from './pages/admin/PendingApprovals';
import StockTransactions from './pages/admin/StockTransactions';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

// --- Navbar Component ---
function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const [showBanner, setShowBanner] = React.useState(true);

    const [darkMode, setDarkMode] = React.useState(() => {
        const savedTheme = localStorage.getItem('admin-theme');
        return savedTheme === 'dark';
    });

    React.useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('admin-theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('admin-theme', 'light');
        }
        window.dispatchEvent(new CustomEvent('themechange'));
    }, [darkMode]);

    // Keep state in sync if changed elsewhere (like AdminLayout.js) without polling
    React.useEffect(() => {
        const handleStorageChange = () => {
            const currentTheme = localStorage.getItem('admin-theme');
            setDarkMode(currentTheme === 'dark');
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('themechange', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('themechange', handleStorageChange);
        };
    }, []);


    const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password');
    const isAdminPage = location.pathname.startsWith('/admin');

    if (isAdminPage) return null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        navigate('/login');
    };

    return (
        <>
            {showBanner && (
                <div className="shopease-top-banner">
                    🎁 Free Delivery on orders above ₹499 | Easy Returns | Secure Payments
                    <button className="close-btn" onClick={() => setShowBanner(false)}>×</button>
                </div>
            )}
            <BootstrapNavbar expand="lg" className="shopease-navbar sticky-top">
                <Container>
                    <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold shopease-brand d-flex align-items-center">
                        <i className="bi bi-bag-fill shopease-brand-logo"></i>
                        <span>ShopEase</span>
                    </BootstrapNavbar.Brand>
                    <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                    <BootstrapNavbar.Collapse id="basic-navbar-nav" className="justify-content-between">
                        {/* Categories (Search Bar Removed) */}
                        <div className="d-none d-lg-flex align-items-center mx-4">
                           
                        </div>

                        {/* Navigation Links */}
                        <Nav className="align-items-center">
                     
                            
             
                            {/* Authentication & Dashboard Redirects */}
                            <div className="ms-3 d-flex align-items-center gap-2">
                                {/* Dark/Light mode switch */}
                                <div className="d-flex align-items-center gap-2 me-2">
                                    <i className={`bi ${darkMode ? 'bi-moon-stars-fill text-warning' : 'bi-sun-fill text-primary'}`} style={{ fontSize: '0.95rem' }}></i>
                                    <label className="theme-toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={darkMode} 
                                            onChange={() => setDarkMode(!darkMode)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                {isAuthPage && (
                                    <Button as={Link} to="/" variant="outline-secondary" className="btn-modern px-3" size="sm" style={{ border: '1px solid #cbd5e0', color: '#4a5568', borderRadius: '8px' }}>
                                        ← Back
                                    </Button>
                                )}
                                {(role === 'ROLE_ADMIN' || role === 'ROLE_STORE_MANAGER') && (
                                    <Button as={Link} to="/admin" className="btn-modern px-3" size="sm" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none' }}>
                                        Admin Panel
                                    </Button>
                                )}
                                
                                {token ? (
                                    <button className="shopease-logout-btn px-3" onClick={handleLogout}>
                                        Logout
                                    </button>
                                ) : (
                                    !isAuthPage && (
                                        <Button as={Link} to="/login" variant="primary" className="shopease-login-btn">
                                            <i className="bi bi-person-circle"></i> Login / Signup
                                        </Button>
                                    )
                                )}
                            </div>
                        </Nav>
                    </BootstrapNavbar.Collapse>
                </Container>
            </BootstrapNavbar>
        </>
    );
}

// --- LandingPage Component (JSX only) ---
function LandingPage() {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Category lists matching reference
    const categories = [
        { name: "Electronics", emoji: "🎧", bg: "#eff6ff" },
        { name: "Fashion", emoji: "👕", bg: "#f0fdf4" },
        { name: "Home & Kitchen", emoji: "🛋️", bg: "#fef2f2" },
        { name: "Beauty", emoji: "🧴", bg: "#faf5ff" },
        { name: "Sports", emoji: "🏀", bg: "#fffbeb" },
        { name: "Books", emoji: "📚", bg: "#ecfeff" },
        { name: "Toys", emoji: "🧸", bg: "#fdf2f8" },
        { name: "Automotive", emoji: "🛞", bg: "#f8fafc" },
    ];

    const containerRef = React.useRef(null);

    const handleScroll = (direction) => {
        if (containerRef.current) {
            const scrollAmount = 300;
            containerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            {/* Hero Section */}
            <div className="shopease-hero-section animate__animated animate__fadeIn">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="text-start">
                            <h1 className="shopease-hero-title fw-bold animate__animated animate__fadeInDown">
                                Everything you love,<br />
                                <span className="blue-text">All in one place.</span>
                            </h1>
                            <p className="shopease-hero-subtext animate__animated animate__fadeInUp">
                                Shop the latest products with real-time stock updates, fast delivery and a seamless shopping experience.
                            </p>
                            <div className="animate__animated animate__fadeInUp animate__delay-1s">
                                <Button 
                                    as={Link} 
                                    to="/user-dashboard" 
                                    className="shopease-btn-blue"
                                >
                                    Show products <i className="bi bi-arrow-right ms-2"></i>
                                </Button>
                                {!token && (
                                     <Button as={Link} to="/login" variant="primary" className="shopease-btn-outline-gray">
                                         <i className="bi bi-person"></i> Login / Signup
                                     </Button>
                                 )}
                            </div>
                            
                            {/* Trusted customers badge */}
                            <div className="shopease-trust-container animate__animated animate__fadeIn animate__delay-1s">
                                <div className="shopease-avatar-group">
                                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="user" className="shopease-avatar" />
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="user" className="shopease-avatar" />
                                    <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="user" className="shopease-avatar" />
                                    <img src="https://randomuser.me/api/portraits/men/15.jpg" alt="user" className="shopease-avatar" />
                                    <img src="https://randomuser.me/api/portraits/women/89.jpg" alt="user" className="shopease-avatar" />
                                </div>
                                <span className="shopease-trust-text">Trusted by 50K+ happy customers</span>
                            </div>
                        </Col>
                        
                        {/* 3D Illustration Column */}
                        <Col lg={6} className="text-center mt-5 mt-lg-0 animate__animated animate__fadeInRight">
                            <Image 
                                src="/landing_hero_3d.jpg" 
                                alt="ShopEase Shopping Mockup" 
                                fluid 
                                className="rounded shadow-sm"
                                style={{ maxWidth: '90%', objectFit: 'contain' }}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Floating Features Bar */}
            <Container className="mb-5">
                <div className="shopease-features-bar animate__animated animate__fadeInUp animate__delay-1s">
                    <Row className="align-items-center">
                        <Col md={4} className="mb-4 mb-md-0">
                            <div className="shopease-feature-item">
                                <div className="shopease-feature-icon-wrapper green">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <div>
                                    <h4 className="shopease-feature-title">Real-Time Stock Transparency</h4>
                                    <p className="shopease-feature-desc">See exact product availability with real-time status badges.</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={1} className="d-none d-md-flex justify-content-center">
                            <div className="shopease-divider"></div>
                        </Col>
                        <Col md={3} className="mb-4 mb-md-0">
                            <div className="shopease-feature-item">
                                <div className="shopease-feature-icon-wrapper blue">
                                    <i className="bi bi-cart3"></i>
                                </div>
                                <div>
                                    <h4 className="shopease-feature-title">Frictionless Cart & Checkout</h4>
                                    <p className="shopease-feature-desc">An intuitive interface makes shopping, updating carts and checkout smooth and fast.</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={1} className="d-none d-md-flex justify-content-center">
                            <div className="shopease-divider"></div>
                        </Col>
                        <Col md={3}>
                            <div className="shopease-feature-item">
                                <div className="shopease-feature-icon-wrapper purple">
                                    <i className="bi bi-bell"></i>
                                </div>
                                <div>
                                    <h4 className="shopease-feature-title">Alert System</h4>
                                    <p className="shopease-feature-desc">Get instant notifications about your orders and order processing status.</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>

            {/* Shop By Category Section */}
            <Container className="py-5 text-start position-relative">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Shop by Category</h2>
                    
                    {/* Carousel navigation controls */}
                    <div className="d-flex gap-2">
                        <button className="shopease-carousel-arrow" onClick={() => handleScroll('left')}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <button className="shopease-carousel-arrow" onClick={() => handleScroll('right')}>
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>

                {/* Categories container */}
                <div 
                    ref={containerRef}
                    className="d-flex gap-4 overflow-auto pb-3 text-center" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map((cat, idx) => (
                        <div 
                            key={idx} 
                            className="shopease-category-card flex-shrink-0" 
                            style={{ width: '160px' }}
                            onClick={() => {
                                if (token && role === 'ROLE_USER') navigate('/user-dashboard');
                                else navigate('/login');
                            }}
                        >
                            <div className="shopease-category-icon-bg" style={{ backgroundColor: cat.bg }}>
                                {cat.emoji}
                            </div>
                            <h5 className="shopease-category-title">{cat.name}</h5>
                        </div>
                    ))}
                </div>
            </Container>

            {/* Bottom Info Bar / Trust Indicators */}
            <div className="shopease-footer-info-bar">
                <Container>
                    <Row className="g-4">
                        <Col md={3} sm={6}>
                            <div className="shopease-info-item">
                                <i className="bi bi-truck shopease-info-icon"></i>
                                <div className="text-start">
                                    <h5 className="shopease-info-title">Free Delivery</h5>
                                    <p className="shopease-info-subtext">On orders above ₹499</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="shopease-info-item">
                                <i className="bi bi-arrow-left-right shopease-info-icon"></i>
                                <div className="text-start">
                                    <h5 className="shopease-info-title">Easy Returns</h5>
                                    <p className="shopease-info-subtext">Hassle-free returns</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="shopease-info-item">
                                <i className="bi bi-shield-check shopease-info-icon"></i>
                                <div className="text-start">
                                    <h5 className="shopease-info-title">Secure Payments</h5>
                                    <p className="shopease-info-subtext">100% secure transactions</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="shopease-info-item">
                                <i className="bi bi-headset shopease-info-icon"></i>
                                <div className="text-start">
                                    <h5 className="shopease-info-title">24/7 Support</h5>
                                    <p className="shopease-info-subtext">We're here to help</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

// --- Footer Component ---
function Footer() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');
    if (isAdminPage) return null;

    return (
        <Container fluid as="footer" className="text-white text-center py-4 mt-auto" style={{ background: '#2d3748' }}>
            <p className="mb-0 opacity-75">&copy; {new Date().getFullYear()} ShopEase. All Rights Reserved.</p>
        </Container>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: 'var(--bg-color)' }}>
                <Navbar />
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        
                        {/* PROTECTED ROUTES */}
                        <Route element={<ProtectedRoute />}>
                            
                            {/* --- NEW ADMIN ROUTES (The Magic Happens Here) --- */}
                            <Route path="/admin" element={<AdminLayout />}>
                                {/* Default Page: Admin Home (Quick Actions) */}
                                <Route index element={<AdminHome />} /> 
                                
                                {/* Sub-Pages mapped to Sidebar Links */}
                                <Route path="products" element={<ManageProducts />} />
                                <Route path="approvals" element={<PendingApprovals />} />
                                <Route path="transactions" element={<StockTransactions />} />
                                <Route path="analytics" element={<AnalyticsDashboard />} />
                                
                                {/* Forecasting & Restock inside Admin Layout */}
                                <Route path="forecasting" element={<ForecastingPage />} />
                                <Route path="restock" element={<RestockPage />} />
                                <Route path="managers" element={<ManageStoreManagers />} />

                                {/* Alerts Page is now a child of /admin */}
                                <Route path="alerts" element={<AlertsPage />} />
                            </Route>

                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/user-dashboard" element={<UserDashboard />} />
                        </Route>
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;