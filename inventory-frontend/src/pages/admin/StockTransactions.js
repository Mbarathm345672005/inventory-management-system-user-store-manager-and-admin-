import React, { useState, useEffect } from 'react';
import StockService from '../../services/stock.service';
import ProductService from '../../services/product.service';
import { Row, Col, Form, Button, Table, Alert, Card, Spinner, Badge } from 'react-bootstrap';

function StockTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [stockForm, setStockForm] = useState({ productId: '', quantity: 0, type: 'STOCK-IN' });
    const [txMessage, setTxMessage] = useState({ type: '', text: '' });
    const [loadingTx, setLoadingTx] = useState(true);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTransactions();
        ProductService.getAllProducts().then(res => setProducts(res.data));
    }, []);

    const fetchTransactions = () => {
        setLoadingTx(true);
        StockService.getHistory()
            .then(response => setTransactions(response.data))
            .catch(error => setTxMessage({ type: 'danger', text: 'Could not load transactions.' }))
            .finally(() => setLoadingTx(false));
    };

    const handleStockSubmit = (e) => {
        e.preventDefault();
        const service = stockForm.type === 'STOCK-IN' ? StockService.stockIn : StockService.stockOut;
        service(stockForm.productId, stockForm.quantity).then(() => {
            setTxMessage({ type: 'success', text: "Stock updated!" });
            fetchTransactions();
            setStockForm({ productId: '', quantity: 0, type: 'STOCK-IN' });
        }).catch(err => setTxMessage({ type: 'danger', text: err.response?.data?.message }));
    };

    const handleStockFormChange = (e) => setStockForm({ ...stockForm, [e.target.name]: e.target.value });

    // Filter transactions in memory using useMemo
    const filteredTransactions = React.useMemo(() => {
        let data = transactions;
        if (typeFilter !== 'ALL') {
            data = data.filter(t => t.type === typeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter(t => 
                (t.productName && t.productName.toLowerCase().includes(q)) ||
                (t.handledBy && t.handledBy.toLowerCase().includes(q))
            );
        }
        return data;
    }, [transactions, typeFilter, searchQuery]);

    // --- NEW HELPER FUNCTION TO FIX DATE ---
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        // Check if it's an array (Spring Boot default for LocalDateTime)
        // Format: [year, month, day, hour, minute, second, nano]
        if (Array.isArray(timestamp)) {
            const [year, month, day, hour, minute, second] = timestamp;
            // Month is 0-indexed in JS Date, but 1-indexed in Java array. 
            // Usually Spring sends 1-based months (1=Jan), so we subtract 1.
            return new Date(year, month - 1, day, hour, minute, second).toLocaleString();
        }

        // If it's already a string, try parsing it directly
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <h2 className="mb-4 text-primary fw-bold">Stock Management</h2>
            
            <Card className="custom-card mb-4 shadow-sm border-success">
                <Card.Header as="h5" className="card-header-modern" style={{ background: 'var(--success-gradient)' }}>
                    Stock Transactions
                </Card.Header>
                <Card.Body>
                    
                    {/* --- SECTION 1: RECORD TRANSACTION (Top) --- */}
                    <div className="mb-5"> 
                        <h5 className="mb-3 fw-bold text-success">Record New Transaction</h5>
                        {txMessage.text && <Alert variant={txMessage.type} dismissible onClose={() => setTxMessage('')}>{txMessage.text}</Alert>}
                        
                        <Form onSubmit={handleStockSubmit} className="p-4 rounded border shadow-sm" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: 'var(--text-primary)' }}>Product</Form.Label>
                                        <Form.Select name="productId" value={stockForm.productId} onChange={handleStockFormChange} required>
                                            <option value="">-- Select Product --</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current: {p.quantity})</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: 'var(--text-primary)' }}>Transaction Type</Form.Label>
                                        <Form.Select name="type" value={stockForm.type} onChange={handleStockFormChange}>
                                            <option value="STOCK-IN">Stock-In (Add)</option>
                                            <option value="STOCK-OUT">Stock-Out (Remove)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold" style={{ color: 'var(--text-primary)' }}>Quantity</Form.Label>
                                        <Form.Control type="number" name="quantity" min="1" value={stockForm.quantity} onChange={handleStockFormChange} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end mt-2">
                                <Button className="btn-modern btn-success px-5" type="submit">
                                    <i className="bi bi-check-circle-fill me-2"></i> Submit Transaction
                                </Button>
                            </div>
                        </Form>
                    </div>

                    <hr className="my-4" style={{ borderColor: 'var(--border)' }} />

                    {/* --- SECTION 2: HISTORY (Bottom) --- */}
                    <div>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-secondary)' }}>Recent Transaction History</h5>
                                <span className="badge bg-secondary-subtle text-secondary small">
                                    Showing {filteredTransactions.length} of {transactions.length} records
                                </span>
                            </div>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Search product / handled by..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ maxWidth: '240px', borderRadius: '8px' }}
                                />
                                <Form.Select
                                    size="sm"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    style={{ maxWidth: '160px', borderRadius: '8px' }}
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="STOCK-IN">Stock-In</option>
                                    <option value="STOCK-OUT">Stock-Out</option>
                                    <option value="SALE">Sale</option>
                                </Form.Select>
                            </div>
                        </div>

                        {loadingTx ? <div className="text-center p-5"><Spinner animation="border" variant="success" /></div> : (
                            <div className="table-responsive">
                                <Table hover className="table-modern align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Product</th>
                                            <th>Type</th>
                                            <th>Qty</th>
                                            <th>Handled By</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map(tx => (
                                            <tr key={tx.id}>
                                                <td className="fw-bold">{tx.productName}</td>
                                                <td>
                                                    <Badge bg={tx.type === 'STOCK-IN' ? 'success' : tx.type === 'SALE' ? 'info' : 'danger'} className="px-3 py-2">
                                                        {tx.type}
                                                    </Badge>
                                                </td>
                                                <td className="fw-bold">{tx.quantity}</td>
                                                <td className="text-muted small">{tx.handledBy}</td>
                                                {/* --- USE HELPER FUNCTION HERE --- */}
                                                <td className="text-muted small">{formatDate(tx.timestamp)}</td>
                                            </tr>
                                        ))}
                                        {filteredTransactions.length === 0 && (
                                            <tr><td colSpan="5" className="text-center py-4 text-muted">No transactions found matching filters.</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>

                </Card.Body>
            </Card>
        </div>
    );
}
export default StockTransactions;