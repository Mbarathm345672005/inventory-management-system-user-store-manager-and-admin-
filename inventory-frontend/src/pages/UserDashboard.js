import React, { useState, useEffect } from 'react';
import ProductService from '../services/product.service';
import TopSellingProducts from './TopSellingProducts';
import { Link, useNavigate } from 'react-router-dom';

// Import Form for the input box
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Toast, ToastContainer, Form, InputGroup, Modal, Offcanvas } from 'react-bootstrap';

function UserDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
    const [addingProductId, setAddingProductId] = useState(null);

    // --- NEW: State to track quantity for EACH product ID ---
    // Example: { "prod_id_1": 3, "prod_id_2": 1 }
    const [quantities, setQuantities] = useState({});

    // --- NEW: Detailed Modal state ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalQuantity, setModalQuantity] = useState(1);

    const [showUserSidebar, setShowUserSidebar] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        setLoading(true);
        setAlertMessage({ type: '', text: '' });
        ProductService.getAllProducts()
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setAlertMessage({ type: 'danger', text: 'Could not load products.' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // --- NEW: Helper to update quantity state ---
    const handleQuantityChange = (productId, change, maxStock) => {
        setQuantities(prev => {
            const currentQty = prev[productId] || 1; // Default is 1 if not set
            const newQty = currentQty + change;

            // Validation: Don't go below 1, don't go above max stock
            if (newQty < 1) return prev;
            if (newQty > maxStock) return prev;

            return { ...prev, [productId]: newQty };
        });
    };

    // --- NEW: Helper to update quantity inside details modal ---
    const handleModalQuantityChange = (change, maxStock) => {
        const newQty = modalQuantity + change;
        if (newQty >= 1 && newQty <= maxStock) {
            setModalQuantity(newQty);
        }
    };

    const handleBuy = (productId, productName, customQty = null) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAlertMessage({ 
                type: 'warning', 
                text: 'Please login first to purchase or add items to your cart!' 
            });
            setSelectedProduct(null); // Close modal if open
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setAlertMessage({ type: '', text: '' });
        setAddingProductId(productId);

        const quantityToAdd = customQty !== null ? customQty : (quantities[productId] || 1);

        // Pass quantity to the service
        ProductService.addToCart(productId, quantityToAdd)
            .then(response => {
                setToastMessage(`Added ${quantityToAdd} x ${productName} to cart!`);
                setShowToast(true);
                
                // Reset quantity back to 1 after adding
                setQuantities(prev => ({...prev, [productId]: 1}));
                setSelectedProduct(null); // Close modal if open

                setTimeout(() => {
                     fetchProducts(); // Refresh to check stock updates
                }, 1000);
            })
            .catch(error => {
                const errorMsg = error.response?.data?.message || "Error adding item to cart.";
                setAlertMessage({ type: 'danger', text: errorMsg });
            })
            .finally(() => {
                 setTimeout(() => setAddingProductId(null), 500);
            });
    };

    // --- NEW: handleBuyNow adds to cart and redirects to cart immediately ---
    const handleModalBuyNow = () => {
        if (!selectedProduct) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
            setAlertMessage({ 
                type: 'warning', 
                text: 'Please login first to purchase or add items to your cart!' 
            });
            setSelectedProduct(null); // Close modal
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        ProductService.addToCart(selectedProduct.id, modalQuantity)
            .then(() => {
                setSelectedProduct(null); // Close modal
                navigate('/cart'); // Redirect to cart page immediately
            })
            .catch(error => {
                const errorMsg = error.response?.data?.message || "Error completing buy now process.";
                setAlertMessage({ type: 'danger', text: errorMsg });
            });
    };

    // --- NEW: handleModalAddToCart adds to cart using the selected quantity ---
    const handleModalAddToCart = () => {
        if (!selectedProduct) return;
        handleBuy(selectedProduct.id, selectedProduct.name, modalQuantity);
    };

    return (
        <Container fluid className="p-4 shopease-user-dashboard-wrapper">
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success" text="white">
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Success</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
 
            <div className="d-flex align-items-center mb-4 gap-3 justify-content-center position-relative">
                <button 
                    className="user-menu-btn three-dot-btn shopease-user-sidebar-trigger d-flex align-items-center justify-content-center position-absolute start-0"
                    onClick={() => setShowUserSidebar(true)}
                    title="User Profile Menu"
                    aria-label="User Profile Menu"
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        cursor: 'pointer'
                    }}
                >
                    <i className="bi bi-three-dots-vertical" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}></i>
                    <span className="visually-hidden">⋮</span>
                </button>
                <h1 className="mb-0 text-center display-5 fw-bold text-success">
                    Welcome to SmartShelfX
                </h1>
            </div>
 
            {/* --- RECOMMENDATION SECTION (Based on Top Sellers) --- */}
            <div className="mb-5">
                <TopSellingProducts onProductClick={setSelectedProduct} />
            </div>
 
            <hr className="my-5" />
 
            {/* --- ALL PRODUCTS SECTION --- */}
            <h3 className="mb-4 fw-bold" style={{ color: 'var(--text-primary)' }}>All Products</h3>
 
            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="grow" variant="success" />
                </div>
            ) : (
                <>
                    {alertMessage.text && (
                        <Alert variant={alertMessage.type} onClose={() => setAlertMessage({ type: '', text: '' })} dismissible>
                            {alertMessage.text}
                        </Alert>
                    )}
 
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {products.map(product => (
                            <Col key={product.id}>
                                <Card className="h-100 custom-card border-0 shadow-sm">
                                    {/* Image Section */}
                                    <div 
                                        className="product-img-container" 
                                        style={{ position: 'relative', height: '200px', overflow: 'hidden', cursor: 'pointer' }}
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <Card.Img
                                            variant="top"
                                            src={product.imageUrl || 'https://placehold.co/300x200?text=Product'}
                                            className="product-img-hover"
                                            style={{ height: '100%', width: '100%', objectFit: 'contain', padding: '10px' }}
                                        />
                                        {product.quantity <= 5 && product.quantity > 0 && (
                                            <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-2 shadow">
                                                Low Stock: {product.quantity} left
                                            </Badge>
                                        )}
                                    </div>
 
                                    <Card.Body className="d-flex flex-column p-3">
                                        <Card.Title 
                                            className="fw-bold" 
                                            style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            {product.name}
                                        </Card.Title>
                                        <Card.Text className="text-muted small">
                                            {product.description ? product.description.substring(0, 50) + "..." : "No description."}
                                        </Card.Text>
                                        
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h4 className="text-primary mb-0 fw-bold">${product.price}</h4>
                                            </div>

                                            {/* --- BULK QUANTITY SELECTOR --- */}
                                            {product.quantity > 0 ? (
                                                <div className="mb-3">
                                                    <InputGroup size="sm">
                                                        <Button 
                                                            variant="outline-secondary" 
                                                            onClick={() => handleQuantityChange(product.id, -1, product.quantity)}
                                                        >
                                                            -
                                                        </Button>
                                                        <Form.Control 
                                                            className="text-center" 
                                                            value={quantities[product.id] || 1} // Read specific qty or default 1
                                                            readOnly 
                                                        />
                                                        <Button 
                                                            variant="outline-secondary" 
                                                            onClick={() => handleQuantityChange(product.id, 1, product.quantity)}
                                                        >
                                                            +
                                                        </Button>
                                                    </InputGroup>
                                                </div>
                                            ) : (
                                                <Alert variant="danger" className="py-1 text-center small mb-3">Out of Stock</Alert>
                                            )}
                                            
                                            <Button 
                                                className="btn-modern btn-primary-modern w-100"
                                                onClick={() => handleBuy(product.id, product.name)}
                                                disabled={product.quantity === 0 || addingProductId === product.id}
                                            >
                                                {addingProductId === product.id ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-cart-plus me-2"></i> 
                                                        Add {(quantities[product.id] || 1) > 1 ? (quantities[product.id] || 1) : ""} to Cart
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* Flipkart-Style Product Details Modal Overlay */}
            {selectedProduct && (
                <Modal size="xl" show={selectedProduct !== null} onHide={() => setSelectedProduct(null)} centered scrollable>
                    <Modal.Header closeButton style={{ borderBottom: 'none' }}>
                        <Modal.Title className="text-muted small">
                            Home &gt; Products &gt; {selectedProduct.name}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-4 pb-5 pt-0">
                        <Row className="g-4">
                            {/* Left Column: Image previews */}
                            <Col lg={5} className="text-center">
                                <div className="border rounded p-3 mb-3 d-flex align-items-center justify-content-center" style={{ height: '380px', position: 'relative', backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                                    <img 
                                        src={selectedProduct.imageUrl || 'https://placehold.co/400x400?text=Product'} 
                                        alt={selectedProduct.name} 
                                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                    />
                                    {selectedProduct.quantity <= 5 && selectedProduct.quantity > 0 && (
                                        <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-3 shadow" style={{ fontSize: '0.85rem' }}>
                                            Only {selectedProduct.quantity} units left!
                                        </Badge>
                                    )}
                                </div>
                                {/* Thumbnail list */}
                                <Row className="gx-2">
                                    {[1, 2, 3, 4].map(idx => (
                                        <Col xs={3} key={idx}>
                                            <div className="border rounded p-1 text-center" style={{ height: '70px', cursor: 'pointer', opacity: idx === 1 ? 1 : 0.6, transition: 'opacity 0.2s', backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                                                <img 
                                                    src={selectedProduct.imageUrl || 'https://placehold.co/70x70?text=Product'} 
                                                    alt="thumbnail" 
                                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Col>

                            {/* Middle Column: Specs & Core Details */}
                            <Col lg={4} className="text-start">
                                <div className="pe-lg-3">
                                    <Badge bg="success" className="mb-2" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '12px' }}>Bestseller</Badge>
                                    <h3 className="fw-bold mb-2" style={{ fontSize: '1.8rem', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>{selectedProduct.name}</h3>
                                    
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div className="text-warning small">
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-half"></i>
                                        </div>
                                        <span className="text-primary small fw-bold" style={{ fontSize: '0.85rem' }}>4.6 (1,248 reviews)</span>
                                        <span className="text-muted small">| 10K+ bought in past month</span>
                                    </div>

                                    <div className="d-flex align-items-baseline gap-2 mb-4">
                                        <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2.2rem' }}>${selectedProduct.price}</h2>
                                        <span className="text-muted text-decoration-line-through">${(selectedProduct.price * 1.15).toFixed(2)}</span>
                                        <span className="text-success small fw-bold">13% OFF</span>
                                    </div>

                                    {/* Bank Offer Box */}
                                    <div className="border rounded p-3 mb-4 text-start" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                                        <div className="d-flex gap-2 align-items-start">
                                            <i className="bi bi-tag-fill text-success" style={{ fontSize: '1.2rem' }}></i>
                                            <div>
                                                <strong className="small" style={{ color: 'var(--text-primary)' }}>Bank Offer</strong>
                                                <p className="mb-0 small text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>10% Instant Discount on HDFC Bank Credit Cards. <Link to="#" className="text-primary text-decoration-none fw-semibold">T&C Apply</Link></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Policies Badges */}
                                    <Row className="mb-4 text-center g-2 text-muted small">
                                        <Col xs={4}>
                                            <div className="p-2 border rounded" style={{ fontSize: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                <i className="bi bi-arrow-counterclockwise text-primary d-block mb-1" style={{ fontSize: '1.3rem' }}></i>
                                                10 Days Returnable
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="p-2 border rounded" style={{ fontSize: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                <i className="bi bi-truck text-primary d-block mb-1" style={{ fontSize: '1.3rem' }}></i>
                                                Free Delivery
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="p-2 border rounded" style={{ fontSize: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                <i className="bi bi-shield-check text-primary d-block mb-1" style={{ fontSize: '1.3rem' }}></i>
                                                1 Year Warranty
                                            </div>
                                        </Col>
                                    </Row>

                                    <h5 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Description</h5>
                                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                                        {selectedProduct.description || "Experience top tier performance with this state of the art product. Engineered to deliver exceptional durability, efficiency, and styling to perfectly suit all your needs."}
                                    </p>
                                </div>
                            </Col>

                            {/* Right Column: Checkout Box */}
                            <Col lg={3}>
                                <Card className="p-3 border-0 shadow-sm text-start" style={{ backgroundColor: 'var(--surface-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="mb-3">
                                        <span className="text-muted small d-block">Delivery to</span>
                                        <div className="d-flex align-items-center justify-content-between mt-1">
                                            <strong style={{ color: 'var(--text-primary)' }}><i className="bi bi-geo-alt-fill text-muted"></i> 560001</strong>
                                            <Link to="#" className="text-primary small text-decoration-none fw-bold">Change</Link>
                                        </div>
                                    </div>

                                    <hr className="my-2" />

                                    <div className="mb-4 mt-2">
                                        {selectedProduct.quantity > 0 ? (
                                            <>
                                                <span className="text-success fw-bold d-block mb-1" style={{ fontSize: '1.05rem' }}>In Stock</span>
                                                <span className="text-muted small" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>Ships within 24 hours. Eligible for cash on delivery.</span>
                                            </>
                                        ) : (
                                            <span className="text-danger fw-bold d-block">Out of Stock</span>
                                        )}
                                    </div>

                                    {selectedProduct.quantity > 0 && (
                                        <>
                                            <div className="mb-4">
                                                <span className="fw-semibold small d-block mb-2" style={{ color: 'var(--text-secondary)' }}>Quantity</span>
                                                <InputGroup size="sm" style={{ maxWidth: '120px' }}>
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        onClick={() => handleModalQuantityChange(-1, selectedProduct.quantity)}
                                                    >
                                                        -
                                                    </Button>
                                                    <Form.Control 
                                                        className="text-center bg-transparent" 
                                                        value={modalQuantity} 
                                                        readOnly 
                                                        style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                                    />
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        onClick={() => handleModalQuantityChange(1, selectedProduct.quantity)}
                                                    >
                                                        +
                                                    </Button>
                                                </InputGroup>
                                            </div>

                                            <Button 
                                                className="shopease-login-submit-btn w-100 py-2.5 fw-bold text-white mb-3 d-flex align-items-center justify-content-center gap-2 border-0"
                                                onClick={handleModalAddToCart}
                                                style={{ borderRadius: '10px' }}
                                            >
                                                <i className="bi bi-cart3"></i> Add to Cart
                                            </Button>

                                            <Button 
                                                variant="outline-primary"
                                                className="w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                                                onClick={handleModalBuyNow}
                                                style={{ borderRadius: '10px', borderColor: '#764ba2', color: '#764ba2', borderWidth: '2px' }}
                                            >
                                                <i className="bi bi-lightning-fill"></i> Buy Now
                                            </Button>
                                        </>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>
            )}
            {/* User Profile Offcanvas Drawer */}
            <Offcanvas show={showUserSidebar} onHide={() => setShowUserSidebar(false)} placement="start" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
                <Offcanvas.Header closeButton style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}>
                    <Offcanvas.Title className="fw-bold" style={{ color: 'var(--text-primary)' }}>My Account</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
                    {/* Profile Avatar (initials-based) */}
                    {(() => {
                        const displayName = localStorage.getItem('username') || localStorage.getItem('email') || 'User';
                        const email = localStorage.getItem('email') || '';
                        const initial = displayName ? displayName[0].toUpperCase() : 'U';
                        return (
                            <div className="text-center mb-4 pt-2">
                                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                                     style={{ width: 64, height: 64, background: 'var(--primary-gradient, #4f46e5)', color: '#fff', fontSize: 26, fontWeight: 700 }}>
                                    {initial}
                                </div>
                                <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{displayName}</h5>
                                {email && <small className="d-block" style={{ color: 'var(--text-secondary)' }}>{email}</small>}
                                <span className="badge bg-secondary-subtle text-secondary mt-2 px-3 py-1">Customer</span>
                            </div>
                        );
                    })()}

                    <hr style={{ borderColor: 'var(--border)' }} />

                    {/* Navigation Actions */}
                    <div className="d-grid gap-3 mt-3">
                        <Button 
                            variant="outline-primary" 
                            className="py-2.5 d-flex align-items-center justify-content-start px-3 gap-2 fw-semibold"
                            onClick={() => {
                                setShowUserSidebar(false);
                                navigate('/cart');
                            }}
                        >
                            <i className="bi bi-cart3 fs-5"></i>
                            <span>My Cart</span>
                        </Button>
                        
                        <Button 
                            variant="outline-secondary" 
                            className="py-2.5 d-flex align-items-center justify-content-start px-3 gap-2 fw-semibold"
                            style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                            onClick={() => {
                                alert("Order History feature coming soon!");
                            }}
                        >
                            <i className="bi bi-clock-history fs-5"></i>
                            <span>Order History</span>
                        </Button>

                        <hr style={{ borderColor: 'var(--border)' }} className="my-2" />

                        <Button 
                            variant="danger" 
                            className="py-2.5 d-flex align-items-center justify-content-start px-3 gap-2 fw-semibold text-white border-0"
                            style={{ backgroundColor: '#EF4444' }}
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('role');
                                localStorage.removeItem('username');
                                localStorage.removeItem('email');
                                navigate('/login');
                            }}
                        >
                            <i className="bi bi-box-arrow-right fs-5"></i>
                            <span>Logout</span>
                        </Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </Container>
    );
}

export default UserDashboard;