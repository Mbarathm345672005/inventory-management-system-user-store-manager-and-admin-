import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Import Bootstrap components
import { Container, Form, Button, Alert, Row, Col, Card, Spinner, InputGroup } from 'react-bootstrap';

function SignUpPage() {
    const [formData, setFormData] = useState({
        name: '', dept: '', email: '', password: '', confirmPassword: '',
        role: 'ROLE_USER', phoneNo: '', warehouseLocation: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    
    // Toggle state for password fields
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        setLoading(true); // Start loading

        try {
            const response = await axios.post('/api/auth/signup', formData);
            setMessage(response.data.message);

            // Hide form and show success message prominently
            // Optionally redirect after a delay
            setTimeout(() => {
                navigate('/login');
            }, 3000); // Redirect after 3 seconds

        } catch (err) {
            if (err.response) {
                setError(err.response.data.message);
            } else if (err.request) {
                setError("Network error: Could not connect to the backend.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <Container fluid className="p-0 d-flex align-items-center justify-content-center position-relative shopease-signup-container shopease-auth-wrapper" style={{ minHeight: 'calc(100vh - 56px)', overflow: 'hidden', py: '60px' }}>
            {/* Watermark Violet Cart Symbols */}
            <div className="shopease-signup-watermark watermark-1"><i className="bi bi-cart3"></i></div>
            <div className="shopease-signup-watermark watermark-2"><i className="bi bi-cart3"></i></div>
            <div className="shopease-signup-watermark watermark-3"><i className="bi bi-cart3"></i></div>
            <div className="shopease-signup-watermark watermark-4"><i className="bi bi-cart3"></i></div>
            <div className="shopease-signup-watermark watermark-5"><i className="bi bi-cart3"></i></div>
            <div className="shopease-signup-watermark watermark-6"><i className="bi bi-cart3"></i></div>
            
            <div className="w-100 py-5" style={{ zIndex: 2, position: 'relative' }}>
                <h1 className="fw-bold text-center mb-1 animate__animated animate__fadeInDown" style={{ fontSize: '2.8rem', color: 'var(--text-primary)' }}>
                    Create Your <span style={{ color: '#764ba2' }}>Account</span>
                </h1>
                <p className="text-center mb-2 animate__animated animate__fadeInDown" style={{ color: 'var(--text-secondary)' }}>
                    Join ShopEase and start managing your inventory with ease.
                </p>
                <div className="mx-auto mb-4 animate__animated animate__fadeInDown" style={{ width: '60px', height: '4px', background: 'var(--primary-gradient)', borderRadius: '2px' }}></div>

                <Row className="g-0 w-100 justify-content-center">
                    <Col xs={11} md={10} lg={8} xl={7} style={{ maxWidth: '820px' }}>
                        <Card className="shopease-login-card shopease-auth-card border-0 shadow p-3 p-md-4 w-100" style={{ borderRadius: '24px' }}>
                            <Card.Body>
                                {/* Show success message prominently if registered */}
                                {message ? (
                                    <Alert variant="success" className="text-center my-4 py-4">
                                        <Alert.Heading className="fw-bold mb-3">Registration Successful!</Alert.Heading>
                                        <p className="mb-3">{message}</p>
                                        <p className="text-muted small mb-3">You will be redirected to the login page shortly.</p>
                                        <Spinner animation="border" size="sm" variant="success" />
                                    </Alert>
                                ) : (
                                    <>
                                        {error && (
                                            <Alert variant="danger" onClose={() => setError('')} dismissible>
                                                {error}
                                            </Alert>
                                        )}
                                        <Form onSubmit={handleSubmit}>
                                            <Row className="mb-3">
                                                {/* Name Field */}
                                                <Form.Group as={Col} md="6" controlId="formSignUpName" className="text-start mb-3 mb-md-0">
                                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Name</Form.Label>
                                                    <InputGroup className="shopease-input-group">
                                                        <InputGroup.Text>
                                                            <i className="bi bi-person"></i>
                                                        </InputGroup.Text>
                                                        <Form.Control 
                                                            type="text" 
                                                            name="name" 
                                                            placeholder="Enter name" 
                                                            onChange={handleChange} 
                                                            required 
                                                        />
                                                    </InputGroup>
                                                </Form.Group>

                                                {/* Email Field */}
                                                <Form.Group as={Col} md="6" controlId="formSignUpEmail" className="text-start">
                                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Email address</Form.Label>
                                                    <InputGroup className="shopease-input-group">
                                                        <InputGroup.Text>
                                                            <i className="bi bi-envelope"></i>
                                                        </InputGroup.Text>
                                                        <Form.Control 
                                                            type="email" 
                                                            name="email" 
                                                            placeholder="Enter email" 
                                                            onChange={handleChange} 
                                                            required 
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                {/* Password Field */}
                                                <Form.Group as={Col} md="6" controlId="formSignUpPassword" className="text-start mb-3 mb-md-0">
                                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Password</Form.Label>
                                                    <InputGroup className="shopease-input-group">
                                                        <InputGroup.Text>
                                                            <i className="bi bi-lock"></i>
                                                        </InputGroup.Text>
                                                        <Form.Control 
                                                            type={showPassword ? "text" : "password"} 
                                                            name="password" 
                                                            placeholder="Password" 
                                                            onChange={handleChange} 
                                                            required 
                                                        />
                                                        <InputGroup.Text 
                                                            onClick={() => setShowPassword(!showPassword)} 
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                                        </InputGroup.Text>
                                                    </InputGroup>
                                                </Form.Group>

                                                {/* Confirm Password Field */}
                                                <Form.Group as={Col} md="6" controlId="formSignUpConfirmPassword" className="text-start">
                                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Confirm Password</Form.Label>
                                                    <InputGroup className="shopease-input-group">
                                                        <InputGroup.Text>
                                                            <i className="bi bi-lock"></i>
                                                        </InputGroup.Text>
                                                        <Form.Control 
                                                            type={showConfirmPassword ? "text" : "password"} 
                                                            name="confirmPassword" 
                                                            placeholder="Confirm Password" 
                                                            onChange={handleChange} 
                                                            required 
                                                        />
                                                        <InputGroup.Text 
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                                        </InputGroup.Text>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                {/* Role Field */}
                                                <Form.Group as={Col} md="6" controlId="formSignUpRole" className="text-start mb-3 mb-md-0">
                                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Role</Form.Label>
                                                    <InputGroup className="shopease-input-group">
                                                        <InputGroup.Text>
                                                            <i className="bi bi-person-badge"></i>
                                                        </InputGroup.Text>
                                                        <Form.Select 
                                                            name="role" 
                                                            value={formData.role} 
                                                            onChange={handleChange} 
                                                            style={{ appearance: 'none', backgroundImage: 'none' }}
                                                        >
                                                            <option value="ROLE_USER">Regular User</option>
                                                            <option value="ROLE_STORE_MANAGER">Store Manager (Requires Approval)</option>
                                                            <option value="ROLE_ADMIN">Admin (Requires Approval)</option>
                                                        </Form.Select>
                                                    </InputGroup>
                                                    {['ROLE_ADMIN', 'ROLE_STORE_MANAGER'].includes(formData.role) && (
                                                        <Alert variant="info" className="mt-2 py-2 px-3 mb-0" style={{ fontSize: '0.85rem' }}>
                                                            <i className="bi bi-info-circle me-1"></i>
                                                            This role requires <strong>admin approval</strong> before you can log in.
                                                        </Alert>
                                                    )}
                                                </Form.Group>

                                                {/* Phone Number Field */}
                                                <Form.Group as={Col} md="6" controlId="formSignUpPhone" className="text-start">
                                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Phone Number</Form.Label>
                                                    <InputGroup className="shopease-input-group">
                                                        <InputGroup.Text>
                                                            <i className="bi bi-telephone"></i>
                                                        </InputGroup.Text>
                                                        <Form.Control 
                                                            type="tel" 
                                                            name="phoneNo" 
                                                            placeholder="Optional" 
                                                            onChange={handleChange} 
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>

                                            <Row className="mb-4">
                                                {/* Department Field */}
                                                <Form.Group as={Col} md="6" controlId="formSignUpDept" className="text-start mb-3 mb-md-0">
                                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Department</Form.Label>
                                                    <InputGroup className="shopease-input-group">
                                                        <InputGroup.Text>
                                                            <i className="bi bi-building"></i>
                                                        </InputGroup.Text>
                                                        <Form.Control 
                                                            type="text" 
                                                            name="dept" 
                                                            placeholder="Optional" 
                                                            onChange={handleChange} 
                                                        />
                                                    </InputGroup>
                                                </Form.Group>

                                                {/* Warehouse Location Field */}
                                                <Form.Group as={Col} md="6" controlId="formSignUpWarehouse" className="text-start">
                                                    <Form.Label className="fw-semibold small mb-1" style={{ color: 'var(--text-primary)' }}>Warehouse Location</Form.Label>
                                                    <InputGroup className="shopease-input-group">
                                                        <InputGroup.Text>
                                                            <i className="bi bi-geo-alt"></i>
                                                        </InputGroup.Text>
                                                        <Form.Control 
                                                            type="text" 
                                                            name="warehouseLocation" 
                                                            placeholder="Optional" 
                                                            onChange={handleChange} 
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Row>

                                            <Button 
                                                type="submit" 
                                                className="shopease-login-submit-btn w-100 py-2.5 fw-bold text-white d-flex align-items-center justify-content-center gap-2 mb-4" 
                                                disabled={loading}
                                                style={{ borderRadius: '30px' }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> 
                                                        Registering...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-person-plus-fill" style={{ fontSize: '1.1rem' }}></i> Sign Up
                                                    </>
                                                )}
                                            </Button>
                                        </Form>
                                        
                                        <div className="text-center text-muted small" style={{ fontSize: '0.85rem' }}>
                                            Already have an account? <Link to="/login" style={{ color: '#2b6cb0', fontWeight: 'bold', textDecoration: 'underline' }}>Login here</Link>
                                        </div>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}

export default SignUpPage;