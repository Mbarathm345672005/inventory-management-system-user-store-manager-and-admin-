import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Row, Col, Card, Spinner } from 'react-bootstrap';
function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/forgot-password', { email });
            setMessage(response.data.message || "A password reset link has been sent to your email.");
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)', background: 'linear-gradient(to bottom right, #f8f9fa, #fff3cd)' }}>
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={5} xl={4}>
                    <Card className="shadow-lg border-warning">
                        <Card.Header className="bg-warning text-dark text-center py-3">
                            <h2 className="mb-0">Reset Password</h2>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {message ? (
                                <Alert variant="success">{message}</Alert>
                            ) : (
                                <>
                                    <p className="text-muted">Enter your email address and we will send you a secure link to reset your password.</p>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-4" controlId="formResetEmail">
                                            <Form.Label>Email address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                        <div className="d-grid">
                                            <Button variant="warning" type="submit" size="lg" disabled={loading}>
                                                {loading ? <Spinner as="span" animation="border" size="sm" /> : "Send Reset Link"}
                                            </Button>
                                        </div>
                                    </Form>
                                </>
                            )}
                            <div className="mt-4 text-center">
                                <Link to="/login" className="fw-bold">Back to Login</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ForgotPasswordPage;