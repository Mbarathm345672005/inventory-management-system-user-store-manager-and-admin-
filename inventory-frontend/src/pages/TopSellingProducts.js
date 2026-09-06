import React, { useState, useEffect } from 'react';
import ProductService from '../services/product.service';
import { Card, Row, Col, Spinner, Button } from 'react-bootstrap';

// A component to fetch and display top-selling products
function TopSellingProducts({ onProductClick }) {
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the top-selling products when the component mounts
        ProductService.getTopSelling()
            .then(response => {
                setTopProducts(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching top selling products:", error);
                setTopProducts([]);
                setLoading(false);
            });
    }, []); // The empty array means this runs once

    // Don't show anything if loading
    if (loading && (!Array.isArray(topProducts) || !topProducts.length)) {
        return (
            <div className="text-center my-4">
                <Spinner animation="border" variant="primary" />
                <p>Loading Top Sellers...</p>
            </div>
        );
    }

    // Don't show the section if there are no top sellers
    if (!Array.isArray(topProducts) || !topProducts.length) {
        return null; // Return nothing if no top sellers
    }

    // If we have products, render the list
    return (
        <div className="my-5 p-4 shopease-top-selling-panel rounded-4 shadow-sm text-start" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="mb-4 fw-bold" style={{ color: 'var(--text-primary)' }}>Top Selling Products</h2>
            <Row xs={1} md={3} lg={5} className="g-4">
                {topProducts.map(product => (
                    <Col key={product.id}>
                        <Card 
                            className="h-100 shadow-sm text-center product-card-hover border-0 shopease-top-selling-card" 
                            style={{ 
                                cursor: 'pointer', 
                                borderRadius: '16px',
                                background: 'var(--surface-secondary)',
                                border: '1px solid var(--border)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }} 
                            onClick={() => onProductClick && onProductClick(product)}
                        >
                            <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                                <Card.Img 
                                    variant="top" 
                                    src={product.imageUrl || `https://placehold.co/150x150/e9ecef/6c757d?text=No+Image`} 
                                    style={{ height: '100%', objectFit: 'contain', padding: '10px' }}
                                />
                            </div>
                            <Card.Body className="d-flex flex-column p-3">
                                <Card.Title as="h6" className="text-truncate fw-bold mb-2" title={product.name} style={{ color: 'var(--text-primary)' }}>
                                    {product.name}
                                </Card.Title>
                                <Card.Text className="fw-bold text-primary mb-3">${Number(product.price || 0).toFixed(2)}</Card.Text>
                                <Button 
                                    className="mt-auto shopease-login-submit-btn py-1 px-3 w-100" 
                                    size="sm" 
                                    style={{ borderRadius: '20px' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onProductClick && onProductClick(product);
                                    }}
                                >
                                    View Details
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default TopSellingProducts;