import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminService from '../services/auth.service';
import ProductService from '../services/product.service';
import StockService from '../services/stock.service';
import { Container, Row, Col, Form, Button, Table, Alert, Card, Spinner, Badge } from 'react-bootstrap';

function AdminDashboard() {
    // --- State Hooks ---
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [products, setProducts] = useState([]);
    const [productForm, setProductForm] = useState({ name: '', description: '', quantity: 0, imageUrl: '', price: 0, expiryDate: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageSourceOption, setImageSourceOption] = useState('url');
    const [productMessage, setProductMessage] = useState({ type: '', text: '' });
    const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [stockForm, setStockForm] = useState({ productId: '', quantity: 0, type: 'STOCK-IN' });
    const [txMessage, setTxMessage] = useState({ type: '', text: '' });
    const [loadingTx, setLoadingTx] = useState(true);

    // --- Get the user's role from localStorage ---
    const userRole = localStorage.getItem('role');

    // --- Determine dashboard title based on role ---
    const dashboardTitle = userRole === 'ROLE_ADMIN' ? 'Admin Dashboard' : 'Store Manager Dashboard';

    // --- Data Fetching ---
    const fetchPendingAdmins = () => {
        setLoadingAdmins(true);
        AdminService.getPendingAdmins()
            .then(response => setPendingAdmins(response.data))
            .catch(error => setAdminMessage({ type: 'danger', text: "Error fetching pending admins." }))
            .finally(() => setLoadingAdmins(false));
    };

    const fetchProducts = () => {
        setLoadingProducts(true);
        ProductService.getAllProducts()
            .then(response => setProducts(response.data))
            .catch(error => setProductMessage({ type: 'danger', text: "Error fetching products." }))
            .finally(() => setLoadingProducts(false));
    };

    const fetchTransactions = () => {
        setLoadingTx(true);
        StockService.getHistory()
            .then(response => setTransactions(response.data))
            .catch(error => setTxMessage({ type: 'danger', text: 'Could not load transactions.' }))
            .finally(() => setLoadingTx(false));
    };

    useEffect(() => {
        // Only fetch pending admins IF the user is an ADMIN
        if (userRole === 'ROLE_ADMIN') {
            fetchPendingAdmins();
        }
        fetchProducts();
        fetchTransactions(); 
    }, [userRole]);

    // --- Handlers ---
    const handleStockFormChange = (e) => {
        setStockForm({ ...stockForm, [e.target.name]: e.target.value });
    };

    const handleStockSubmit = (e) => {
        e.preventDefault();
        setTxMessage({ type: '', text: '' });
        const { productId, quantity, type } = stockForm;

        const service = type === 'STOCK-IN' ? StockService.stockIn : StockService.stockOut;

        service(productId, quantity)
            .then(response => {
                setTxMessage({ type: 'success', text: `Stock successfully updated!` });
                fetchProducts(); // Refresh the product list
                fetchTransactions(); // Refresh the transaction history
                setStockForm({ productId: '', quantity: 0, type: 'STOCK-IN' }); // Reset form
            })
            .catch(error => {
                const errorMsg = error.response?.data?.message || `Error processing ${type}.`;
                setTxMessage({ type: 'danger', text: errorMsg });
            });
    };

    const handleApprove = (userId) => {
        setAdminMessage({ type: '', text: '' });
        AdminService.approveAdmin(userId)
            .then(response => {
                setAdminMessage({ type: 'success', text: response.data.message });
                fetchPendingAdmins();
            })
            .catch(error => setAdminMessage({ type: 'danger', text: "Error approving admin." }));
    };

    const handleDecline = (userId) => {
        if (window.confirm('Are you sure you want to decline this admin request? This will remove the user.')) {
            setAdminMessage({ type: '', text: '' });
            AdminService.declineAdmin(userId)
                .then(response => {
                    setAdminMessage({ type: 'warning', text: response.data.message });
                    fetchPendingAdmins();
                })
                .catch(error => setAdminMessage({ type: 'danger', text: "Error declining admin." }));
        }
    };

    const handleProductChange = (e) => {
        setProductForm({ ...productForm, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setProductForm({ ...productForm, imageUrl: '' });
        } else {
             setSelectedFile(null);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setProductMessage({ type: '', text: '' });
        let finalImageUrl = productForm.imageUrl;

        if (imageSourceOption === 'upload' && selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const token = localStorage.getItem('token');
                const uploadResponse = await axios.post('/api/files/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                finalImageUrl = uploadResponse.data.url;
                if (!finalImageUrl) {
                    throw new Error("Backend did not return a valid image URL after upload.");
                }
            } catch (error) {
                console.error("File upload error:", error);
                const errorMsg = error.response?.data?.message || "File upload failed. Check backend endpoint.";
                setProductMessage({ type: 'danger', text: errorMsg });
                return;
            }
        } else if (imageSourceOption === 'upload' && !selectedFile) {
             setProductMessage({ type: 'warning', text: 'Please select a file to upload or switch to URL input.' });
             return;
        }

        const productData = { ...productForm, imageUrl: finalImageUrl };

        ProductService.createProduct(productData)
            .then(response => {
                setProductMessage({ type: 'success', text: "Product created successfully!" });
                fetchProducts();
                setProductForm({ name: '', description: '', quantity: 0, imageUrl: '', price: 0 });
                setSelectedFile(null);
                setImageSourceOption('url');
            })
            .catch(error => {
                 const errorMsg = error.response?.data?.message || "Error creating product.";
                 setProductMessage({ type: 'danger', text: errorMsg });
             });
    };

    const handleProductDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProductMessage({ type: '', text: '' });
            ProductService.deleteProduct(id)
                .then(response => {
                    setProductMessage({ type: 'warning', text: response.data.message });
                    fetchProducts();
                })
                .catch(error => setProductMessage({ type: 'danger', text: "Error deleting product." }));
        }
    };

    const handleQuantityUpdate = (id, newQuantity) => {
        if (newQuantity < 0 || newQuantity === '' || isNaN(newQuantity)) {
            setProductMessage({ type: 'warning', text: "Quantity must be a non-negative number." });
             fetchProducts();
            return;
        }
        setProductMessage({ type: '', text: '' });
        const product = products.find(p => p.id === id);
        const updatedProduct = { ...product, quantity: parseInt(newQuantity, 10) };

        ProductService.updateProduct(id, updatedProduct)
            .then(response => {
                setProductMessage({ type: 'info', text: `Quantity for ${product.name} updated!` });
                fetchProducts();
            })
            .catch(error => setProductMessage({ type: 'danger', text: "Error updating quantity." }));
    };
    
    // --- JSX Structure ---
    return (
        <Container fluid className="p-4 animate__animated animate__fadeIn">
            
            <h1 className="mb-4 fw-bold" style={{ color: 'var(--text-primary)' }}>{dashboardTitle}</h1>

            {/* --- 1. NEW: QUICK ACTIONS CARD (Restock & Forecast) --- */}
            <Card className="custom-card mb-4">
                <Card.Header as="h5" className="card-header-modern" style={{ background: 'var(--success-gradient)' }}>
                    <i className="bi bi-lightning-charge-fill me-2"></i> Quick Actions
                </Card.Header>
                <Card.Body className="d-flex gap-3 p-4">
                    <Link to="/forecasting" style={{textDecoration: 'none'}}>
                        <Button className="btn-modern btn-primary-modern" size="lg">
                            <i className="bi bi-graph-up me-2"></i> Demand Forecasting
                        </Button>
                    </Link>
                    <Link to="/restock" style={{textDecoration: 'none'}}>
                        <Button className="btn-modern btn-warning-modern" size="lg">
                            <i className="bi bi-box-seam me-2"></i> Restock Suggestions
                        </Button>
                    </Link>
                </Card.Body>
            </Card>

            {/* --- CARD 2: PENDING ADMINS (Conditional) --- */}
            {userRole === 'ROLE_ADMIN' && (
                <Card className="custom-card mb-4">
                    <Card.Header as="h5" className="card-header-modern" style={{ background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' }}>
                        <i className="bi bi-person-check-fill me-2"></i> Pending Approvals
                    </Card.Header>
                    <Card.Body>
                        {loadingAdmins ? (
                            <div className="text-center"><Spinner animation="border" variant="info" /></div>
                        ) : (
                            <>
                                {adminMessage.text && (
                                    <Alert variant={adminMessage.type} onClose={() => setAdminMessage({ type: '', text: '' })} dismissible>
                                        {adminMessage.text}
                                    </Alert>
                                )}
                                {pendingAdmins.length === 0 ? (
                                    <p className="text-muted">No pending approvals.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover className="table-modern align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingAdmins.map(admin => (
                                                    <tr key={admin.id}>
                                                        <td>{admin.name}</td>
                                                        <td>{admin.email}</td>
                                                        <td>
                                                            <Badge bg={admin.role === 'ROLE_ADMIN' ? 'danger' : 'secondary'}>
                                                                {admin.role.replace('ROLE_', '')}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Button className="btn-modern btn-success me-2" size="sm" onClick={() => handleApprove(admin.id)}>Approve</Button>
                                                            <Button className="btn-modern btn-danger" size="sm" onClick={() => handleDecline(admin.id)}>Decline</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* --- CARD 3: STOCK TRANSACTIONS --- */}
            <Card className="custom-card mb-4">
                <Card.Header as="h5" className="card-header-modern" style={{ background: 'var(--success-gradient)' }}>
                    <i className="bi bi-arrow-left-right me-2"></i> Stock Transactions
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={4} className="border-end mb-3 mb-md-0">
                            <h5 className="mb-3 fw-bold">Record Transaction</h5>
                            {txMessage.text && (
                                <Alert variant={txMessage.type} onClose={() => setTxMessage({ type: '', text: '' })} dismissible>
                                    {txMessage.text}
                                </Alert>
                            )}
                            <Form onSubmit={handleStockSubmit}>
                                <Form.Group className="mb-3" controlId="txProduct">
                                    <Form.Label>Product</Form.Label>
                                    <Form.Select
                                        name="productId"
                                        value={stockForm.productId}
                                        onChange={handleStockFormChange}
                                        required
                                    >
                                        <option value="">-- Select a Product --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Current: {p.quantity})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="txType">
                                    <Form.Label>Transaction Type</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={stockForm.type}
                                        onChange={handleStockFormChange}
                                    >
                                        <option value="STOCK-IN">Stock-In (Add to inventory)</option>
                                        <option value="STOCK-OUT">Stock-Out (Remove from inventory)</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="txQuantity">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={stockForm.quantity}
                                        onChange={handleStockFormChange}
                                        required
                                    />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button className="btn-modern btn-success" type="submit">Submit Transaction</Button>
                                </div>
                            </Form>
                        </Col>
                        <Col md={8}>
                            <h5 className="mb-3 fw-bold">Recent Transaction History</h5>
                            {loadingTx ? (
                                <div className="text-center"><Spinner animation="border" variant="success" /></div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="table-modern align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Type</th>
                                                <th>Qty</th>
                                                <th>Handled By</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(tx => (
                                                <tr key={tx.id}>
                                                    <td>{tx.productName}</td>
                                                    <td>
                                                        <Badge bg={tx.type === 'STOCK-IN' ? 'success' : 'danger'}>
                                                            {tx.type}
                                                        </Badge>
                                                    </td>
                                                    <td>{tx.quantity}</td>
                                                    <td>{tx.handledBy}</td>
                                                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            
            {/* --- CARD 4: CREATE NEW PRODUCT --- */}
            <Card className="custom-card mb-4">
                <Card.Header as="h5" className="card-header-modern">
                    <i className="bi bi-plus-circle-fill me-2"></i> Create New Product
                </Card.Header>
                <Card.Body>
                     {productMessage.text && (productMessage.text.includes('created') || productMessage.text.includes('creating') || productMessage.type === 'danger' || productMessage.type === 'warning') && (
                        <Alert variant={productMessage.type} onClose={() => setProductMessage({ type: '', text: '' })} dismissible>
                            {productMessage.text}
                        </Alert>
                    )}
                    <Form onSubmit={handleProductSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formProductName">
                                <Form.Label>Product Name</Form.Label>
                                <Form.Control type="text" placeholder="e.g., Laptop Pro" name="name" value={productForm.name} onChange={handleProductChange} required />
                            </Form.Group>
                             <Form.Group as={Col} md="6" controlId="formProductPrice">
                                <Form.Label>Price ($)</Form.Label>
                                <Form.Control type="number" min="0" step="0.01" placeholder="e.g., 99.99" name="price" value={productForm.price} onChange={handleProductChange} required />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            {/* ... Quantity ... */}
                            <Form.Group as={Col} md="6">
                                <Form.Label>Expiry Date (Optional)</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="expiryDate" 
                                    value={productForm.expiryDate} 
                                    onChange={handleProductChange} 
                                />
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3" controlId="formProductDesc">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={2} placeholder="Product details..." name="description" value={productForm.description} onChange={handleProductChange} />
                        </Form.Group>
                         <Row className="mb-3">
                            <Form.Group as={Col} xs="6" md="6" controlId="formProductQty">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control type="number" min="0" name="quantity" value={productForm.quantity} onChange={handleProductChange} required />
                            </Form.Group>
                        </Row>

                        <Form.Group className="mb-3">
                             <Form.Label>Product Image</Form.Label>
                             <div>
                                 <Form.Check
                                     inline type="radio" label="Enter URL" name="imageSource" id="imageUrl" value="url"
                                     checked={imageSourceOption === 'url'}
                                     onChange={(e) => {setImageSourceOption(e.target.value); setSelectedFile(null);}}
                                 />
                                  <Form.Check
                                     inline type="radio" label="Upload File" name="imageSource" id="imageUpload" value="upload"
                                     checked={imageSourceOption === 'upload'}
                                     onChange={(e) => {setImageSourceOption(e.target.value); setProductForm({...productForm, imageUrl: ''});}}
                                 />
                             </div>
                          </Form.Group>

                        {imageSourceOption === 'upload' ? (
                            <Form.Group controlId="formProductFile" className="mb-3">
                                <Form.Label>Select Image File</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif, image/webp"
                                    onChange={handleFileChange}
                                    key={selectedFile ? 'file-selected' : 'no-file'}
                                />
                                {selectedFile && <Form.Text muted>Selected: {selectedFile.name}</Form.Text>}
                            </Form.Group>
                        ) : (
                             <Form.Group controlId="formProductImageUrl" className="mb-3">
                                <Form.Label>Image URL</Form.Label>
                                <Form.Control
                                    type="text" placeholder="https://..." name="imageUrl"
                                    value={productForm.imageUrl}
                                    onChange={handleProductChange}
                                />
                                <Form.Text muted>Enter a publicly accessible URL.</Form.Text>
                            </Form.Group>
                        )}
                        <div className="d-grid">
                            <Button className="btn-modern btn-primary-modern" type="submit" size="lg">Create Product</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* --- CARD 5: MANAGE AVAILABLE PRODUCTS --- */}
            <Card className="custom-card mb-4">
                <Card.Header as="h5" className="card-header-modern" style={{ background: 'linear-gradient(135deg, #434343 0%, #000000 100%)' }}>
                    <i className="bi bi-list-ul me-2"></i> Manage Available Products
                </Card.Header>
                <Card.Body>
                     {productMessage.text && !(productMessage.text.includes('created') || productMessage.text.includes('creating')) && (
                        <Alert variant={productMessage.type} onClose={() => setProductMessage({ type: '', text: '' })} dismissible>
                            {productMessage.text}
                        </Alert>
                    )}
                     {loadingProducts ? (
                        <div className="text-center"><Spinner animation="border" variant="secondary" /></div>
                    ) : products.length === 0 ? (
                        <p className="text-muted">No products found. Add one using the form above.</p>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="table-modern align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th className="text-end">Price</th>
                                        <th className="text-center" style={{ minWidth: '100px' }}>Quantity</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td className="text-end">${product.price ? product.price.toFixed(2) : '0.00'}</td>
                                            <td className="text-center">
                                                <Form.Control
                                                    type="number" min="0"
                                                    defaultValue={product.quantity}
                                                    onBlur={(e) => handleQuantityUpdate(product.id, e.target.value)}
                                                    style={{ width: '80px', margin: 'auto', textAlign: 'center' }}
                                                    aria-label={`Quantity for ${product.name}`}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Button className="btn-modern btn-danger" size="sm" onClick={() => handleProductDelete(product.id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AdminDashboard;