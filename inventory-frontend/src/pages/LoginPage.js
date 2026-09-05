import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Import Bootstrap components
import { Container, Form, Button, Alert, Row, Col, Card, Spinner, Modal, Badge } from 'react-bootstrap';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state for button
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [demoNotice, setDemoNotice] = useState('');
    const navigate = useNavigate();

    const handleFillDemo = (demoEmail, demoPassword, roleLabel) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError('');
        setDemoNotice(roleLabel);
        if (showDemoModal) {
            setShowDemoModal(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true); // Start loading

        try {
            const response = await axios.post('/api/auth/login', { email, password });

            const { token, role, validated } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            // Issue 1: Extract username and email
            const usernameToStore = response.data.name || response.data.username || response.data.email || email;
            localStorage.setItem('username', usernameToStore);
            if (response.data.email || email) {
                localStorage.setItem('email', response.data.email || email);
            }

            // Redirect based on role (already correct)
           if ((role === 'ROLE_ADMIN' || role === 'ROLE_STORE_MANAGER') && validated) {
        navigate('/admin');
    } else if (role === 'ROLE_USER') {
        navigate('/user-dashboard');
    } else {
                 // This case might happen if backend logic changes or role isn't recognized
                 setError("Login successful, but role access is unclear.");
                 localStorage.clear(); // Clear storage if invalid state
            }

        } catch (err) {
            // Error handling (already improved)
            if (err.response) {
                if (err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else if (err.response.status === 401) {
                    setError("Login failed: Invalid email or password.");
                } else {
                    setError(`Error: ${err.response.statusText || 'An unexpected error occurred.'}`);
                }
            } else if (err.request) {
                setError("Network error: Could not connect to the backend.");
            } else {
                setError(err.message);
            }
        } finally {
             setLoading(false); // Stop loading regardless of outcome
        }
    };

    return (
        <Container fluid className="p-0 d-flex align-items-stretch shopease-auth-wrapper" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <Row className="g-0 w-100">
                {/* Left Column: Hero Text & Features (Flipkart style) */}
                <Col lg={6} className="d-none d-lg-flex flex-column justify-content-center text-start p-5 position-relative" style={{ background: 'linear-gradient(135deg, #f8fafd 0%, #ffffff 100%)', borderRight: '1px solid #e5e7eb' }}>
                    <div className="shopease-login-bg-circle"></div>
                    
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px', margin: '0 auto 0 40px' }}>
                        <h1 className="shopease-hero-title fw-bold" style={{ fontSize: '3.2rem', lineHeight: '1.15', color: '#0b0f19', marginBottom: '20px' }}>
                            Everything you love,<br />
                            <span className="blue-text" style={{ color: '#2b6cb0' }}>All in one place.</span>
                        </h1>
                        <p className="shopease-hero-subtext mb-5" style={{ color: '#718096', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Shop the latest products with real-time stock updates, fast delivery and a seamless shopping experience.
                        </p>

                        {/* Features list arranged vertically */}
                        <div className="d-flex flex-column gap-4">
                            <div className="shopease-feature-item-vertical d-flex align-items-start gap-3">
                                <div className="shopease-feature-icon-wrapper green flex-shrink-0">
                                    <i className="bi bi-box-seam" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem', color: '#0b0f19' }}>Real-Time Stock Transparency</h5>
                                    <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>See exact product availability with real-time status badges.</p>
                                </div>
                            </div>

                            <div className="shopease-feature-item-vertical d-flex align-items-start gap-3">
                                <div className="shopease-feature-icon-wrapper blue flex-shrink-0">
                                    <i className="bi bi-cart3" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem', color: '#0b0f19' }}>Frictionless Cart & Checkout</h5>
                                    <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>An intuitive interface makes shopping, updating carts and checkout smooth and fast.</p>
                                </div>
                            </div>

                            <div className="shopease-feature-item-vertical d-flex align-items-start gap-3">
                                <div className="shopease-feature-icon-wrapper purple flex-shrink-0">
                                    <i className="bi bi-bell" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem', color: '#0b0f19' }}>Alert System</h5>
                                    <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>Get instant notifications about your orders and order processing status.</p>
                                </div>
                            </div>
                        </div>

                        {/* Trusted customers badge */}
                        <div className="shopease-trust-container d-flex align-items-center gap-2 mt-5">
                            <div className="shopease-avatar-group">
                                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="user" className="shopease-avatar" />
                                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="user" className="shopease-avatar" />
                                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="user" className="shopease-avatar" />
                                <img src="https://randomuser.me/api/portraits/men/15.jpg" alt="user" className="shopease-avatar" />
                            </div>
                            <span className="shopease-trust-text text-muted small">Trusted by 50K+ happy customers</span>
                        </div>
                    </div>

                    {/* Overlapping illustration image */}
                    <div className="shopease-login-illustration-container d-none d-xl-block">
                        <img 
                            src="/landing_hero_3d.jpg" 
                            alt="ShopEase Shopping Mockup" 
                            className="shopease-login-illustration-img" 
                        />
                    </div>
                </Col>

                {/* Right Column: Modern Login Form Card */}
                <Col xs={12} lg={6} className="d-flex align-items-center justify-content-center p-4 p-md-5 shopease-auth-col">
                    <Card className="shopease-login-card shopease-auth-card border-0 shadow p-3 p-md-4 w-100" style={{ maxWidth: '540px', borderRadius: '24px' }}>
                        <Card.Body>
                            <h2 className="text-center fw-bold mb-3 shopease-login-title" style={{ color: '#764ba2', fontSize: '2.2rem', letterSpacing: '-0.5px' }}>Login</h2>
                            
                            {/* Demo Accounts Quick Fill Box */}
                            <div className="mb-4 p-3" style={{
                                background: 'rgba(102, 126, 234, 0.07)',
                                borderRadius: '14px',
                                border: '1px dashed #764ba2'
                            }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="fw-bold small d-flex align-items-center gap-1" style={{ color: '#764ba2' }}>
                                        <i className="bi bi-lightning-charge-fill text-warning"></i> Demo Quick Login
                                    </span>
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 text-decoration-none fw-semibold"
                                        style={{ fontSize: '0.78rem', color: '#2b6cb0' }}
                                        onClick={() => setShowDemoModal(true)}
                                    >
                                        <i className="bi bi-key me-1"></i>View Passwords
                                    </Button>
                                </div>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button 
                                        type="button"
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="flex-fill rounded-pill fw-semibold py-1 px-2" 
                                        style={{ fontSize: '0.78rem' }}
                                        onClick={() => handleFillDemo('admin@shopease.com', 'AdminPassword123!', 'Admin')}
                                    >
                                        🛡️ Admin
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="outline-success" 
                                        size="sm" 
                                        className="flex-fill rounded-pill fw-semibold py-1 px-2" 
                                        style={{ fontSize: '0.78rem' }}
                                        onClick={() => handleFillDemo('manager@shopease.com', 'ManagerPassword123!', 'Store Manager')}
                                    >
                                        🏬 Manager
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="outline-dark" 
                                        size="sm" 
                                        className="flex-fill rounded-pill fw-semibold py-1 px-2" 
                                        style={{ fontSize: '0.78rem' }}
                                        onClick={() => handleFillDemo('user@shopease.com', 'UserPassword123!', 'Customer')}
                                    >
                                        👤 Customer
                                    </Button>
                                </div>
                                {demoNotice && (
                                    <div className="mt-2 text-success small fw-semibold text-center" style={{ fontSize: '0.78rem' }}>
                                        <i className="bi bi-check-circle-fill me-1"></i> Auto-filled <strong>{demoNotice}</strong> credentials! Click Login to enter.
                                    </div>
                                )}
                            </div>

                            {error && (
                                <Alert variant="danger" onClose={() => setError('')} dismissible>
                                    {error}
                                </Alert>
                            )}

                            <Form noValidate onSubmit={handleSubmit}>
                                <Form.Group className="mb-3 text-start" controlId="formLoginEmail">
                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        isInvalid={submitted && !email.trim()}
                                        style={{ borderRadius: '10px', padding: '10px 14px' }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a valid email address.
                                    </Form.Control.Feedback>
                                    <Form.Text className="small d-block mt-1" style={{ color: 'var(--text-secondary)' }}>
                                        We'll never share your email with anyone else.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4 text-start" controlId="formLoginPassword">
                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        isInvalid={submitted && !password.trim()}
                                        style={{ borderRadius: '10px', padding: '10px 14px' }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please enter your password.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button 
                                    type="submit" 
                                    className="shopease-login-submit-btn w-100 py-2.5 fw-bold text-white mb-2" 
                                    disabled={loading}
                                    style={{ borderRadius: '30px' }}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> 
                                            Logging In...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </Button>

                                <div className="text-end mb-4">
                                    <Link to="/forgot-password" style={{ color: '#2b6cb0', fontSize: '0.85rem', fontWeight: '500', textDecoration: 'none' }}>
                                        Forgot Password?
                                    </Link>
                                </div>

                                {/* Separator */}
                                <div className="d-flex align-items-center my-4">
                                    <div className="flex-grow-1" style={{ height: '1px', backgroundColor: 'var(--border)' }}></div>
                                    <span className="mx-3 small" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>or continue with</span>
                                    <div className="flex-grow-1" style={{ height: '1px', backgroundColor: 'var(--border)' }}></div>
                                </div>

                                {/* Continue with Google / Apple */}
                                <Button 
                                    variant="outline-secondary" 
                                    className="w-100 py-2.5 mb-3 d-flex align-items-center justify-content-center gap-2 shopease-oauth-btn"
                                    style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                    </svg>
                                    Continue with Google
                                </Button>

                                <Button 
                                    variant="outline-secondary" 
                                    className="w-100 py-2.5 mb-4 d-flex align-items-center justify-content-center gap-2 shopease-oauth-btn"
                                    style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                                >
                                    <i className="bi bi-apple" style={{ fontSize: '1.1rem' }}></i>
                                    Continue with Apple
                                </Button>

                                {/* Gradient Bottom Bar */}
                                <div className="w-100" style={{ height: '6px', background: 'var(--primary-gradient)', borderRadius: '3px', marginBottom: '24px' }}></div>

                                <div className="text-center text-muted small" style={{ fontSize: '0.85rem' }}>
                                    Don't have an account? <Link to="/signup" style={{ color: '#2b6cb0', fontWeight: 'bold', textDecoration: 'underline' }}>Sign up here</Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Demo Credentials Modal */}
            <Modal show={showDemoModal} onHide={() => setShowDemoModal(false)} centered>
                <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}>
                    <Modal.Title className="h5 fw-bold mb-0">
                        <i className="bi bi-shield-lock-fill me-2"></i>Demo Account Credentials
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4" style={{ backgroundColor: 'var(--surface)' }}>
                    <p className="text-muted small mb-3">
                        Select an account below or click <strong>Use Account</strong> to automatically populate the login fields:
                    </p>
                    
                    <div className="d-flex flex-column gap-3">
                        {/* Admin Account */}
                        <div className="p-3 border rounded-3" style={{ background: 'rgba(102, 126, 234, 0.06)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold" style={{ color: '#2b6cb0' }}>🛡️ Administrator</span>
                                <Badge bg="primary">Full Admin Access</Badge>
                            </div>
                            <div className="small text-muted mb-2">Access: Dashboard, Products, Forecasting, Approvals, Alerts, Transactions</div>
                            <div className="small font-monospace bg-white p-2 rounded mb-2 border">
                                <div><strong>Email:</strong> admin@shopease.com</div>
                                <div><strong>Password:</strong> AdminPassword123!</div>
                            </div>
                            <Button 
                                size="sm" 
                                variant="primary" 
                                className="w-100 py-1 fw-semibold"
                                onClick={() => handleFillDemo('admin@shopease.com', 'AdminPassword123!', 'Admin')}
                            >
                                Use Admin Account
                            </Button>
                        </div>

                        {/* Store Manager Account */}
                        <div className="p-3 border rounded-3" style={{ background: 'rgba(56, 161, 105, 0.06)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-success">🏬 Store Manager</span>
                                <Badge bg="success">Operations Access</Badge>
                            </div>
                            <div className="small text-muted mb-2">Access: Inventory Management, Restock Orders, Products</div>
                            <div className="small font-monospace bg-white p-2 rounded mb-2 border">
                                <div><strong>Email:</strong> manager@shopease.com</div>
                                <div><strong>Password:</strong> ManagerPassword123!</div>
                            </div>
                            <Button 
                                size="sm" 
                                variant="success" 
                                className="w-100 py-1 fw-semibold text-white"
                                onClick={() => handleFillDemo('manager@shopease.com', 'ManagerPassword123!', 'Store Manager')}
                            >
                                Use Store Manager Account
                            </Button>
                        </div>

                        {/* Customer Account */}
                        <div className="p-3 border rounded-3" style={{ background: 'rgba(113, 128, 150, 0.06)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>👤 Customer</span>
                                <Badge bg="secondary">Customer Access</Badge>
                            </div>
                            <div className="small text-muted mb-2">Access: Product Storefront, Live Cart, Checkout, Dashboard</div>
                            <div className="small font-monospace bg-white p-2 rounded mb-2 border">
                                <div><strong>Email:</strong> user@shopease.com</div>
                                <div><strong>Password:</strong> UserPassword123!</div>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline-dark" 
                                className="w-100 py-1 fw-semibold"
                                onClick={() => handleFillDemo('user@shopease.com', 'UserPassword123!', 'Customer')}
                            >
                                Use Customer Account
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDemoModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default LoginPage;