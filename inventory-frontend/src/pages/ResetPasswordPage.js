import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Row, Col, Card, Spinner } from 'react-bootstrap';

function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // This hook from react-router-dom reads the ":token" part of the URL
    const { token } = useParams(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/reset-password', { token, newPassword });
            setMessage(response.data.message);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired token. Please try again.");
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
                            <h2 className="mb-0">Set New Password</h2>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {message ? (
                                <Alert variant="success">{message}</Alert>
                            ) : (
                                <>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3" controlId="formNewPassword">
                                            <Form.Label>New Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-4" controlId="formConfirmPassword">
                                            <Form.Label>Confirm New Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Confirm password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                        <div className="d-grid">
                                            <Button variant="warning" type="submit" size="lg" disabled={loading}>
                                                {loading ? <Spinner as="span" animation="border" size="sm" /> : "Reset Password"}
                                            </Button>
                                        </div>
                                    </Form>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ResetPasswordPage;