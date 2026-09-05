import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Spinner, Modal, Alert } from 'react-bootstrap';
// We assume you have an auth-header helper, if not, standard axios works too
import axios from 'axios'; 
import ForecastChart from './ForecastChart';
import ForecastService from '../services/forecast.service'; // Import the new chart component

function ForecastingPage() {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the Modal (Popup)
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchForecast();
    }, []);

    const fetchForecast = () => {
        setLoading(true);
        // Get token from local storage
        const token = localStorage.getItem('token'); 
        
        axios.get('http://localhost:8080/api/forecast', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setForecasts(response.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching forecast:", err);
            setError("Failed to load forecast data. Ensure all 3 services (React, Java, Python) are running.");
            setLoading(false);
        });
    };

    // Helper function to open the chart modal
    const handleShowTrend = (productData) => {
        setSelectedProduct(productData);
        setShowModal(true);
    };

    // Helper function to close the modal
    const handleClose = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };
    const handleExport = () => {
        ForecastService.downloadForecastReport()
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'Demand_Forecast_Report.xlsx');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch((error) => {
                console.error("Export failed", error);
                // Optional: set an error state to show an alert
            });
    };

    return (
        <Container className="mt-4">
<div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">Demand Forecasting Dashboard</h2>
                <Button variant="success" onClick={handleExport}>
                    <i className="bi bi-file-earmark-spreadsheet-fill me-2"></i> Export Forecast
                </Button>
            </div>            
            {/* 7-Day Forecast Section */}
            <div className="p-3 mb-4 bg-primary text-white rounded">
                <h4>7-Day Forecast & Stock Alert</h4>
                <p className="mb-0">This table analyzes historical sales to predict demand for the next 7 days.</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Analyzing sales data with AI...</p>
                </div>
            ) : (
                <div className="shopease-table-container">
                    <Table striped hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Product Name (SKU)</th>
                                <th className="text-center">Current Stock</th>
                                <th className="text-center">Forecasted Demand (7 Days)</th>
                                <th className="text-center">Status / Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecasts.map(item => (
                                <tr key={item.productId}>
                                    <td className="fw-bold">{item.productName}</td>
                                    
                                    {/* Current Stock */}
                                    <td className="text-center">
                                        <Badge bg={item.currentStock === 0 ? 'danger' : 'secondary'} className="fs-6">
                                            {item.currentStock}
                                        </Badge>
                                    </td>

                                    {/* Forecast Number */}
                                    <td className="text-center fw-bold fs-5">
                                        {item.forecastNext7Days}
                                    </td>

                                    {/* Status & Action Button */}
                                    <td className="text-center">
                                        {/* Show Status Badge */}
                                        {item.action.includes("ERROR") ? (
                                            <Badge bg="secondary">{item.action}</Badge>
                                        ) : item.action.includes("STOCKOUT") ? (
                                            <Badge bg="danger">STOCKOUT RISK</Badge>
                                        ) : item.action.includes("WARNING") ? (
                                            <Badge bg="warning" text="dark">LOW STOCK RISK</Badge>
                                        ) : (
                                            <Badge bg="success">OK</Badge>
                                        )}

                                        {/* View Trend Button (Only if no error) */}
                                        {!item.action.includes("ERROR") && (
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="ms-3"
                                                onClick={() => handleShowTrend(item)}
                                            >
                                                <i className="bi bi-graph-up"></i> View Trend
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* --- THE CHART POPUP (MODAL) --- */}
            <Modal show={showModal} onHide={handleClose} size="lg" centered className="shopease-trend-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Demand Trend: <span className="text-primary">{selectedProduct?.productName}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProduct && (
                        <>
                            <div className="shopease-prediction-banner d-flex align-items-center gap-2 px-3 py-2.5 mb-4">
                                <i className="bi bi-info-circle-fill text-info"></i>
                                <span>Predicted Demand for next 7 days: <strong>{selectedProduct.forecastNext7Days} units</strong></span>
                            </div>
                            {/* Insert the Chart Component */}
                            <ForecastChart data={selectedProduct.trendData} />
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}

export default ForecastingPage;