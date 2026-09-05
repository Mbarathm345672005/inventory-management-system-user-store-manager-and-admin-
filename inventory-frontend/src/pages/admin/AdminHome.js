import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import ProductService from '../../services/product.service';

function AdminHome() {
    const [analytics, setAnalytics] = useState({
        ordersToday: 0,
        revenueToday: 0,
        ordersMonth: 0,
        revenueMonth: 0
    });
    const [totalProducts, setTotalProducts] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [analyticsRes, productsRes] = await Promise.all([
                    ProductService.getAnalytics(),
                    ProductService.getAllProducts()
                ]);

                if (analyticsRes && analyticsRes.data) {
                    setAnalytics(analyticsRes.data);
                }

                if (productsRes && productsRes.data) {
                    setTotalProducts(productsRes.data.length);
                    const lowStock = productsRes.data.filter(p => p.quantity <= 5);
                    setLowStockCount(lowStock.length);
                }
            } catch (error) {
                console.error("Error loading dashboard metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Overview Dashboard</h2>
                    <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>Live system inventory, order performance, and operations launcher.</p>
                </div>
                <Link to="/admin/analytics">
                    <Button variant="outline-primary" className="btn-modern px-3" size="sm">
                        <i className="bi bi-bar-chart-line me-1"></i> Full Analytics
                    </Button>
                </Link>
            </div>

            {loading ? (
                <Row className="g-3 mb-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Col key={i} sm={6} lg={4} xl={2}>
                            <Card className="custom-card shadow-sm h-100 placeholder-glow" style={{ borderLeft: '4px solid var(--border)' }}>
                                <Card.Body className="p-3 text-center">
                                    <span className="placeholder col-7 d-inline-block rounded mb-2" style={{ height: '14px' }}></span>
                                    <h3 className="my-2">
                                        <span className="placeholder col-5 d-inline-block rounded" style={{ height: '28px' }}></span>
                                    </h3>
                                    <span className="placeholder col-4 d-inline-block rounded" style={{ height: '18px' }}></span>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <>
                    {/* Live Metric Cards */}
                    <Row className="g-3 mb-4">
                        <Col sm={6} lg={4} xl={2}>
                            <Card className="custom-card shadow-sm h-100" style={{ borderLeft: '4px solid #6366f1' }}>
                                <Card.Body className="p-3 text-center">
                                    <span className="small fw-semibold text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        Orders Today
                                    </span>
                                    <h3 className="fw-bold my-2" style={{ color: 'var(--text-primary)' }}>
                                        {analytics.ordersToday}
                                    </h3>
                                    <span className="badge bg-primary-subtle text-primary small">Today</span>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col sm={6} lg={4} xl={2}>
                            <Card className="custom-card shadow-sm h-100" style={{ borderLeft: '4px solid #10b981' }}>
                                <Card.Body className="p-3 text-center">
                                    <span className="small fw-semibold text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        Revenue Today
                                    </span>
                                    <h3 className="fw-bold my-2" style={{ color: 'var(--text-primary)' }}>
                                        ₹{Number(analytics.revenueToday || 0).toLocaleString()}
                                    </h3>
                                    <span className="badge bg-success-subtle text-success small">Today</span>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col sm={6} lg={4} xl={2}>
                            <Card className="custom-card shadow-sm h-100" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                <Card.Body className="p-3 text-center">
                                    <span className="small fw-semibold text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        Orders Month
                                    </span>
                                    <h3 className="fw-bold my-2" style={{ color: 'var(--text-primary)' }}>
                                        {analytics.ordersMonth}
                                    </h3>
                                    <span className="badge bg-info-subtle text-info small">Monthly</span>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col sm={6} lg={4} xl={2}>
                            <Card className="custom-card shadow-sm h-100" style={{ borderLeft: '4px solid #ef4444' }}>
                                <Card.Body className="p-3 text-center">
                                    <span className="small fw-semibold text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        Revenue Month
                                    </span>
                                    <h3 className="fw-bold my-2" style={{ color: 'var(--text-primary)' }}>
                                        ₹{Number(analytics.revenueMonth || 0).toLocaleString()}
                                    </h3>
                                    <span className="badge bg-danger-subtle text-danger small">Monthly</span>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col sm={6} lg={4} xl={2}>
                            <Card className="custom-card shadow-sm h-100" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <Card.Body className="p-3 text-center">
                                    <span className="small fw-semibold text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        Total Products
                                    </span>
                                    <h3 className="fw-bold my-2" style={{ color: 'var(--text-primary)' }}>
                                        {totalProducts}
                                    </h3>
                                    <Link to="/admin/products" className="small text-decoration-none" style={{ color: 'var(--primary)' }}>
                                        View catalog →
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col sm={6} lg={4} xl={2}>
                            <Card className="custom-card shadow-sm h-100" style={{ borderLeft: '4px solid #f59e0b' }}>
                                <Card.Body className="p-3 text-center">
                                    <span className="small fw-semibold text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        Low Stock
                                    </span>
                                    <h3 className="fw-bold my-2" style={{ color: lowStockCount > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                                        {lowStockCount}
                                    </h3>
                                    <Link to="/admin/restock" className="small text-decoration-none" style={{ color: '#f59e0b' }}>
                                        {lowStockCount > 0 ? 'Restock now →' : 'Healthy stock'}
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Quick Operations Actions */}
                    <h4 className="fw-bold mt-4 mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h4>
                    <Row xs={1} md={2} className="g-4 mb-4">
                        <Col>
                            <Card 
                                className="h-100 shadow-sm custom-card" 
                                style={{ 
                                    border: '1px solid rgba(99, 102, 241, 0.4)', 
                                    backgroundColor: 'var(--card-bg)' 
                                }}
                            >
                                <Card.Body className="text-center p-4 p-lg-5">
                                    <div className="mb-3 text-primary"><i className="bi bi-graph-up-arrow fs-1"></i></div>
                                    <h3 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Demand Forecasting</h3>
                                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Predict future sales and inventory trends using AI analytics.</p>
                                    <Link to="/admin/forecasting">
                                        <Button className="btn-modern btn-primary-modern px-4">View Forecast</Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card 
                                className="h-100 shadow-sm custom-card" 
                                style={{ 
                                    border: '1px solid rgba(245, 158, 11, 0.4)', 
                                    backgroundColor: 'var(--card-bg)' 
                                }}
                            >
                                <Card.Body className="text-center p-4 p-lg-5">
                                    <div className="mb-3 text-warning"><i className="bi bi-box-seam fs-1"></i></div>
                                    <h3 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Restock Suggestions</h3>
                                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>View automated purchase orders and restock thresholds.</p>
                                    <Link to="/admin/restock">
                                        <Button className="btn-modern btn-warning-modern px-4">Manage Restock</Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}

export default AdminHome;