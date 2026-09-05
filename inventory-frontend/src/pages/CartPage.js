import React, { useState, useEffect } from 'react';
import ProductService from '../services/product.service';
import { Link } from 'react-router-dom';

// Import necessary Bootstrap components
import { Container, Table, Button, Alert, Image, Card, Spinner, Row, Col } from 'react-bootstrap';
// Optional: Import an icon library if you have one installed (e.g., react-bootstrap-icons)
// import { CartXFill } from 'react-bootstrap-icons';

// --- Define the component function ---
function CartPage() {
    // --- State Hooks (Define state variables and setters here) ---
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' }); // Message state

    // --- Data Fetching ---
    const fetchCartDetails = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' }); // Clear message on fetch
        try {
            console.log("Fetching cart..."); // Log Start
            const cartResponse = await ProductService.getCart();
            const basicCart = cartResponse.data;

            console.log("Received basicCart from backend:", basicCart); // Log the raw response

            // Check the condition carefully
            if (!basicCart || basicCart.length === 0) {
                console.log("BasicCart is empty, setting cartItems to []"); // Log empty check
                setCartItems([]);
                // setLoading(false); // No need to set loading false here, finally block handles it
                return; // Exit early if cart is empty
            }

            console.log("BasicCart has items, fetching details..."); // Log details fetch start

            // Fetch details only if basicCart has items
            const detailedCartPromises = basicCart.map(async (item) => {
                // Handle potential errors fetching individual product details
                try {
                    const productResponse = await ProductService.getProductById(item.productId);
                    // console.log(`Product details for ${item.productId}:`, productResponse.data); // Optional log
                    if (productResponse.data) {
                         return {
                             ...productResponse.data, // product details
                             cartQuantity: item.quantity  // Use a distinct name like cartQuantity
                         };
                    } else {
                        // If a product is somehow missing but was in cart, show placeholder
                         console.warn(`Product with ID ${item.productId} not found, but was in cart.`);
                         return { id: item.productId, name: 'Product Not Found', price: 0, cartQuantity: item.quantity, imageUrl: null };
                    }
                } catch (prodError) {
                     console.error(`Error fetching product details for ID ${item.productId}:`, prodError);
                     return { id: item.productId, name: 'Error Loading Product', price: 0, cartQuantity: item.quantity, imageUrl: null };
                }
            });

            const detailedCart = await Promise.all(detailedCartPromises);
            console.log("Setting detailedCart:", detailedCart); // Log final cart state
            setCartItems(detailedCart);

        } catch (error) {
            console.error("Error in fetchCartDetails:", error); // Log any fetch errors
            setMessage({ type: 'danger', text: 'Could not load your cart. Please try again.' });
        } finally {
            setLoading(false); // Make sure loading stops in all cases
        }
    };

    // --- useEffect hook to call fetchCartDetails on mount ---
    useEffect(() => {
        fetchCartDetails();
    }, []); // Empty dependency array means run once on mount

    // --- Handler ---
    const handleRemove = (productId) => {
        setMessage({ type: '', text: '' }); // Clear message
        // Add confirmation
        if (window.confirm('Are you sure you want to remove this item from your cart?')) {
            ProductService.removeFromCart(productId)
                .then(response => {
                    setMessage({ type: 'warning', text: response.data.message }); // Use warning for removal
                    fetchCartDetails(); // Refresh the cart
                })
                .catch(error => {
                    setMessage({ type: 'danger', text: 'Error removing item.' });
                });
        }
    };

    const handleCheckout = () => {
        setMessage({ type: '', text: '' }); // Clear any old messages
        
        // Add confirmation
        if (window.confirm('Are you sure you want to proceed to checkout?')) {
            ProductService.checkout() // Call the new service function
                .then(response => {
                    // --- SUCCESS ---
                    // Show the success message from the backend
                    alert(response.data.message); 
                    
                    // Reload the page to clear the cart and update stock on other pages
                    window.location.reload(); 
                })
                .catch(error => {
                    // --- ERROR ---
                    const resMessage =
                      (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                      error.message ||
                      error.toString();
                    
                    // Show the specific error (e.g., "Item out of stock")
                    setMessage({ type: 'danger', text: resMessage });
                });
        }
    };

    // Calculate total price
    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);

    // --- JSX Structure ---
    return (
        <Container fluid className="p-4 shopease-cart-wrapper">
            <h1 className="mb-4 fw-bold d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                Your Shopping Cart
            </h1>

            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 fs-5" style={{ color: 'var(--text-secondary)' }}>Loading your cart...</p>
                </div>
            ) : (
                <>
                    {message.text && (
                        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible className="shadow-sm">
                            {message.text}
                        </Alert>
                    )}

                    {cartItems.length === 0 ? (
                        <Card className="text-center shadow-sm border-info" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                            <Card.Body>
                                <Card.Title as="h3" className="text-info">Your Cart is Empty!</Card.Title>
                                <Card.Text style={{ color: 'var(--text-secondary)' }}>
                                    Looks like you haven't added any items yet.
                                </Card.Text>
                                <Button variant="primary" as={Link} to="/user-dashboard">
                                    Start Shopping
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="shopease-table-container">
                            <Table striped bordered hover responsive className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '10%' }}>Product</th>
                                        <th>Name</th>
                                        <th className="text-end">Price</th>
                                        <th className="text-center">Quantity</th>
                                        <th className="text-end">Total</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map(item => (
                                        item && item.id ? (
                                            <tr key={item.id}>
                                                <td>
                                                    <Image
                                                        src={item.imageUrl || 'https://via.placeholder.com/75?text=N/A'}
                                                        alt={item.name || 'Product Image'}
                                                        thumbnail
                                                        style={{ width: '75px', height: '75px', objectFit: 'contain' }}
                                                    />
                                                </td>
                                                <td>{item.name || 'Unknown Product'}</td>
                                                <td className="text-end">${item.price ? item.price.toFixed(2) : '0.00'}</td>
                                                <td className="text-center">{item.cartQuantity || 0}</td>
                                                <td className="text-end fw-bold">${(item.price * (item.cartQuantity || 0)).toFixed(2)}</td>
                                                <td className="text-center">
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleRemove(item.id)} title="Remove item">
                                                        Remove
                                                    </Button>
                                                </td>
                                            </tr>
                                        ) : null
                                    ))}
                                </tbody>
                            </Table>

                            {/* Total Price Section */}
                            <Row className="justify-content-end mt-4">
                                <Col md={5} lg={4}>
                                    <Card body className="text-end border-success" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--success)' }}>
                                        <h4 className="mb-1 text-success">Cart Total:</h4>
                                        <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>${totalPrice.toFixed(2)}</h2>
                                        <Button 
                                            variant="success" 
                                            size="lg" 
                                            className="mt-3 w-100"
                                            onClick={handleCheckout}
                                        >
                                            Proceed to Checkout
                                        </Button>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
} // --- End of the component function ---

export default CartPage; // --- Export the component ---