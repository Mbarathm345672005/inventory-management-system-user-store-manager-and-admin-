import React, { useState, useEffect } from 'react';
import NotificationService from '../services/notification.service';
import { Container, Button, Badge, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';

function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchAlerts(); }, []);

    const fetchAlerts = () => {
        setLoading(true);
        NotificationService.getAllNotifications()
            .then(res => { 
                setAlerts(res.data); 
                setLoading(false); 
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load alerts.");
                setLoading(false);
            });
    };

    const handleDismiss = (id) => {
        // Optimistic UI update
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));

        NotificationService.markAsRead(id)
            .catch(err => {
                console.error("Error dismissing alert", err);
            });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        if (Array.isArray(timestamp)) {
            const [year, month, day, hour, minute, second] = timestamp;
            return new Date(year, month - 1, day, hour, minute, second || 0).toLocaleString();
        }

        return new Date(timestamp).toLocaleString();
    };

    // Color theme logic based on alert text and type
    const getAlertStyle = (id, message, type) => {
        if (message.toLowerCase().includes('only 0 left')) {
            return {
                icon: 'bi-exclamation-triangle-fill',
                theme: 'warning-theme'
            };
        }
        if (message.toLowerCase().includes('only 1 left') || message.toLowerCase().includes('only 2 left')) {
            return {
                icon: 'bi-x-circle-fill',
                theme: 'danger-theme'
            };
        }
        if (message.toLowerCase().includes('only 3 left')) {
            return {
                icon: 'bi-check-circle-fill',
                theme: 'success-theme'
            };
        }
        return {
            icon: 'bi-box-seam-fill',
            theme: 'info-theme'
        };
    };

    const visibleAlerts = alerts.filter(alert => !alert.isRead);

    return (
        <Container fluid className="px-0 py-2 animate__animated animate__fadeIn">
            <div className="d-flex align-items-center justify-content-between mb-4 text-start">
                <div>
                    <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>Alerts & Notifications</h2>
                    <p className="text-muted small mb-0">Track and manage all system alerts and stock status notices</p>
                </div>
            </div>

            {error && <Alert variant="danger" className="rounded-3 shadow-sm">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="grow" variant="primary" />
                    <p className="text-muted small mt-2">Loading system alerts...</p>
                </div>
            ) : (
                <div className="mt-3">
                    {visibleAlerts.length === 0 ? (
                        <Card className="text-center py-5 border-0 shadow-sm rounded-3">
                            <Card.Body>
                                <i className="bi bi-bell-slash text-muted d-block mb-3" style={{ fontSize: '3rem' }}></i>
                                <h5 className="fw-bold">All clear!</h5>
                                <p className="text-muted small mb-0">There are no unread system alerts or stock warnings at this time.</p>
                            </Card.Body>
                        </Card>
                    ) : (
                        visibleAlerts.map(alert => {
                            const style = getAlertStyle(alert.id, alert.message, alert.type);
                            return (
                                <div key={alert.id} className="alert-card-row d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3 w-100 w-md-auto mb-3 mb-md-0">
                                        {/* Colored Rounded Icon */}
                                        <div className={`alert-icon-wrapper ${style.theme}`}>
                                            <i className={`bi ${style.icon}`} style={{ fontSize: '1.25rem' }}></i>
                                        </div>

                                        {/* Status Tag */}
                                        <span className={`badge rounded-pill fw-bold alert-status-badge px-2.5 py-1.5 ${style.theme}`} style={{ fontSize: '0.72rem' }}>
                                            {alert.type}
                                        </span>

                                        {/* Message Text */}
                                        <span className="fw-bold text-start ms-1" style={{ fontSize: '0.95rem' }}>
                                            {alert.message}
                                        </span>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between w-100 w-md-auto gap-4">
                                        {/* Timestamp */}
                                        <span className="text-secondary-theme small fw-medium" style={{ color: 'var(--text-secondary)' }}>
                                            {formatDate(alert.createdAt)}
                                        </span>

                                        {/* Action Button */}
                                        <button 
                                            className="alert-dismiss-btn px-3 py-1.5"
                                            onClick={() => handleDismiss(alert.id)}
                                        >
                                            <i className="bi bi-trash"></i> Dismiss
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </Container>
    );
}

export default AlertsPage;