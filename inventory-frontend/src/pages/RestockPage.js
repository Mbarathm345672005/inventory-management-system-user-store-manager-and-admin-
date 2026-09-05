import React, { useState, useEffect } from 'react';
import ProductService from '../services/product.service';
import { Container, Table, Badge, Button, Modal, Form, Alert, Spinner, Card } from 'react-bootstrap';

function RestockPage() {
    const [suggestions, setSuggestions] = useState([]);
    const [poHistory, setPoHistory] = useState([]); // Ensure this state exists
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [vendorEmail, setVendorEmail] = useState('');
    const [orderQty, setOrderQty] = useState(0);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Suggestions AND History
            const [suggestionsRes, historyRes] = await Promise.all([
                ProductService.getRestockSuggestions(),
                ProductService.getPOHistory() 
            ]);
            
            setSuggestions(suggestionsRes.data);
            setPoHistory(historyRes.data); 
            
        } catch (err) {
            console.error(err);
            // Don't break the whole page if history fails
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPO = (item) => {
        setSelectedItem(item);
        const suggestedQty = item.forecastNext7Days - item.currentStock;
        setOrderQty(suggestedQty > 0 ? suggestedQty : 10);
        setVendorEmail('');
        setShowModal(true);
    };

    const handleSendPO = () => {
        setSending(true);
        const poData = {
            productId: selectedItem.productId,
            productName: selectedItem.productName,
            quantityToOrder: parseInt(orderQty),
            vendorEmail: vendorEmail
        };

        ProductService.createPO(poData)
            .then(res => {
                setMessage({ type: 'success', text: res.data.message });
                setShowModal(false);
                setSending(false);
                fetchData(); // Refresh history
            })
            .catch(err => {
                setMessage({ type: 'danger', text: "Failed to send PO." });
                setSending(false);
            });
    };

    // --- DATE FIX HELPER FUNCTION ---
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        // Array format from Java: [year, month, day, hour, minute, second]
        if (Array.isArray(timestamp)) {
            const [year, month, day, hour, minute, second] = timestamp;
            // Subtract 1 from month because JS months are 0-11
            return new Date(year, month - 1, day, hour, minute, second || 0).toLocaleString();
        }
        // Standard string format
        return new Date(timestamp).toLocaleString();
    };

    return (
        <Container className="mt-4 animate__animated animate__fadeIn">
            <div className="d-flex align-items-center mb-4">
                <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Restock Management</h2>
            </div>
            
            {message && <Alert variant={message.type} dismissible onClose={() => setMessage('')}>{message.text}</Alert>}

            {/* --- SECTION 1: SUGGESTIONS --- */}
            <Card className="custom-card mb-5 shadow-sm border-warning">
                <Card.Header as="h5" className="card-header-modern" style={{ background: 'var(--secondary-gradient)', color: '#333' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> Suggested Actions
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                        <div className="table-responsive">
                            <Table hover className="table-modern align-middle mb-0">
                                <thead className="bg-light">
                                    <tr><th>Product</th><th>Current Stock</th><th>Forecast (7 Days)</th><th>Status</th><th className="text-center">Action</th></tr>
                                </thead>
                                <tbody>
                                    {suggestions.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center p-4 text-muted">No items need restocking right now!</td></tr>
                                    ) : (
                                        suggestions.map(item => (
                                            <tr key={item.productId}>
                                                <td className="fw-bold">{item.productName}</td>
                                                <td><Badge bg="secondary">{item.currentStock}</Badge></td>
                                                <td className="fw-bold text-primary">{item.forecastNext7Days}</td>
                                                <td><Badge bg="danger" className="text-uppercase">{item.action}</Badge></td>
                                                <td className="text-center">
                                                    <Button className="btn-modern btn-success" size="sm" onClick={() => handleOpenPO(item)}>
                                                        Generate PO
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* --- SECTION 2: PURCHASE ORDER HISTORY (Fixed Date) --- */}
            <Card className="custom-card shadow-sm border-info">
                <Card.Header as="h5" className="card-header-modern" style={{ background: 'var(--info-gradient)' }}>
                    <i className="bi bi-clock-history me-2"></i> Purchase Order History
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="table-modern align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Date Sent</th>
                                    <th>Product</th>
                                    <th>Qty Ordered</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {poHistory.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center p-4 text-muted">No purchase orders found.</td></tr>
                                ) : (
                                    poHistory.map(po => (
                                        <tr key={po.id}>
                                            {/* --- USE THE HELPER FUNCTION HERE --- */}
                                            <td>{formatDate(po.createdAt)}</td>
                                            <td className="fw-bold">{po.productName}</td>
                                            <td>{po.quantityToOrder}</td>
                                            <td>{po.vendorEmail}</td>
                                            <td><Badge bg={po.status === 'CONFIRMED' ? 'success' : 'secondary'}>{po.status}</Badge></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* PO Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="card-header-modern">
                    <Modal.Title>Generate Purchase Order</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedItem && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-muted">Product</Form.Label>
                                <Form.Control type="text" value={selectedItem.productName} readOnly className="bg-light" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-muted">Quantity to Order</Form.Label>
                                <Form.Control type="number" value={orderQty} onChange={(e) => setOrderQty(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-muted">Vendor Email</Form.Label>
                                <Form.Control type="email" placeholder="vendor@example.com" value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button className="btn-modern btn-primary-modern" onClick={handleSendPO} disabled={sending}>
                        {sending ? <><Spinner size="sm" animation="border" className="me-2"/> Sending...</> : 'Send PO & Email'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default RestockPage;