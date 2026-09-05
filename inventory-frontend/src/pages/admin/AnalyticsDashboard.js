import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spinner, Button, Badge, ButtonGroup } from 'react-bootstrap';
import ProductService from '../../services/product.service';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyticsDashboard() {
    const [isDark, setIsDark] = useState(() => document.body.classList.contains('dark-theme'));

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.body.classList.contains('dark-theme'));
        };
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        window.addEventListener('themechange', updateTheme);
        window.addEventListener('storage', updateTheme);
        return () => {
            observer.disconnect();
            window.removeEventListener('themechange', updateTheme);
            window.removeEventListener('storage', updateTheme);
        };
    }, []);

    // 1. Static Data State
    const [analytics, setAnalytics] = useState({ ordersToday: 0, revenueToday: 0, ordersMonth: 0, revenueMonth: 0 });
    const [lowStock, setLowStock] = useState([]);
    
    // 2. Data State
    const [revenueChartData, setRevenueChartData] = useState(null);
    const [topProducts, setTopProducts] = useState([]); // Will hold "All Time" top products

    // 3. REVENUE FILTER ONLY
    const [revenueFilter, setRevenueFilter] = useState('monthly');
    
    const [loading, setLoading] = useState(true);

    // Initial Load (Static Data + Top Products)
    useEffect(() => {
        fetchStaticData();
    }, []);

    // Load Revenue when revenue filter changes
    useEffect(() => {
        fetchRevenueData(revenueFilter);
    }, [revenueFilter]);

    // --- API FUNCTIONS ---

    const fetchStaticData = async () => {
        try {
            // A. Summary Cards
            const summaryRes = await ProductService.getAnalytics();
            setAnalytics(summaryRes.data);

            // B. Low Stock
            const productsRes = await ProductService.getAllProducts();
            setLowStock(productsRes.data.filter(p => p.quantity <= 5));

            // C. Top Selling (ALL TIME) - Passed 'all' to get everything
            const topRes = await ProductService.getTopSelling('all');
            setTopProducts(topRes.data);

            setLoading(false);
        } catch (error) {
            console.error("Error loading static data", error);
            setLoading(false);
        }
    };

    const fetchRevenueData = async (period) => {
        try {
            const trendRes = await ProductService.getTrends(period);
            const { labels, data } = trendRes.data;
            setRevenueChartData({
                labels: labels,
                datasets: [
                    { 
                        label: `Revenue (${period})`, 
                        data: data, 
                        backgroundColor: '#66bb6a', 
                        borderRadius: 5 
                    },
                ],
            });
        } catch (error) {
            console.error("Error loading revenue", error);
        }
    };

    const handleDownload = () => {
        ProductService.downloadReport().then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Inventory_Report.xlsx');
            document.body.appendChild(link);
            link.click();
        });
    };

    const FilterButtons = ({ currentFilter, setFilter }) => (
        <ButtonGroup size="sm">
            {['daily', 'weekly', 'monthly'].map((period) => (
                <Button
                    key={period}
                    variant={currentFilter === period ? 'primary' : 'outline-secondary'}
                    onClick={() => setFilter(period)}
                    className="text-capitalize"
                    style={{ fontSize: '0.8rem' }}
                >
                    {period}
                </Button>
            ))}
        </ButtonGroup>
    );

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: isDark ? '#cbd5e1' : '#374151'
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f8fafc' : '#1e293b',
                bodyColor: isDark ? '#cbd5e1' : '#475569',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                },
                ticks: {
                    color: isDark ? '#e2e8f0' : '#475569'
                }
            },
            y: {
                grid: {
                    color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                },
                ticks: {
                    color: isDark ? '#e2e8f0' : '#475569'
                }
            }
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Analytics Overview</h2>
                <Button variant="success" className="btn-modern" onClick={handleDownload}>
                    <i className="bi bi-file-earmark-spreadsheet me-2"></i> Export Report
                </Button>
            </div>

            {/* --- 1. Summary Cards --- */}
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="text-white text-center shadow-sm" style={{ backgroundColor: '#5c6bc0' }}>
                        <Card.Body>
                            <h5>Orders Today</h5>
                            <h2 className="fw-bold">{analytics.ordersToday}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-white text-center shadow-sm" style={{ backgroundColor: '#66bb6a' }}>
                        <Card.Body>
                            <h5>Revenue Today</h5>
                            <h2 className="fw-bold">₹{analytics.revenueToday.toFixed(0)}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-white text-center shadow-sm" style={{ backgroundColor: '#7e57c2' }}>
                        <Card.Body>
                            <h5>Orders Month</h5>
                            <h2 className="fw-bold">{analytics.ordersMonth}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-white text-center shadow-sm" style={{ backgroundColor: '#ef5350' }}>
                        <Card.Body>
                            <h5>Revenue Month</h5>
                            <h2 className="fw-bold">₹{analytics.revenueMonth.toFixed(0)}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- 2. Dynamic Bar Chart (With Filters) --- */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card className="custom-card shadow-sm">
                        <Card.Header className="fw-bold d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                            <span><i className="bi bi-cash-coin me-2 text-success"></i> Revenue Trends</span>
                            {/* REVENUE FILTER BUTTONS */}
                            <FilterButtons currentFilter={revenueFilter} setFilter={setRevenueFilter} />
                        </Card.Header>
                        <Card.Body>
                            <div style={{ height: '350px', backgroundColor: 'var(--surface-secondary)', borderRadius: '12px', padding: '16px' }}>
                                {revenueChartData && <Bar key={isDark ? 'dark-chart' : 'light-chart'} data={revenueChartData} options={chartOptions} />}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- 3. Top Selling Products (STATIC - All Time) --- */}
            <Card className="custom-card mb-4 shadow-sm">
                <Card.Header className="fw-bold" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                    <i className="bi bi-trophy-fill text-warning me-2"></i> Top Selling Products (All Time)
                </Card.Header>
                <Card.Body>
                    {topProducts.length === 0 ? (
                        <div className="text-center p-5" style={{ color: 'var(--text-secondary)' }}>
                            <i className="bi bi-basket display-4 d-block mb-3"></i>
                            <p>No products sold yet.</p>
                        </div>
                    ) : (
                        <Table hover className="table-modern align-middle mb-0">
                            <thead style={{ backgroundColor: 'var(--surface-secondary)' }}>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Stock Left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                {p.imageUrl && (
                                                    <img src={p.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain' }} className="me-3" />
                                                )}
                                                <span className="fw-bold">{p.name}</span>
                                            </div>
                                        </td>
                                        <td>₹{p.price}</td>
                                        <td>
                                            {p.quantity <= 5 ? (
                                                <Badge bg="danger">Low: {p.quantity}</Badge>
                                            ) : (
                                                <Badge bg="success">In Stock: {p.quantity}</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* --- 4. Low Stock (Static) --- */}
            <Card className="custom-card mb-4 shadow-sm border-warning">
                <Card.Header className="bg-warning text-dark fw-bold">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> Low Stock Alert
                </Card.Header>
                <Card.Body>
                    {lowStock.length === 0 ? (
                        <p className="text-center text-muted">All stock levels are healthy.</p>
                    ) : (
                        <Table hover className="table-modern align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Stock Left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>₹{p.price}</td>
                                        <td className="fw-bold text-danger">{p.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}

export default AnalyticsDashboard;