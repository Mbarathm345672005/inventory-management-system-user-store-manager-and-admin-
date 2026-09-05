import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Alert, Modal, Spinner } from 'react-bootstrap';
import UserService from '../../services/user.service'; // Import the new service

function ManageStoreManagers() {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = () => {
        setLoading(true);
        UserService.getStoreManagers()
            .then(res => setManagers(res.data))
            .catch(err => console.error("Error fetching managers", err))
            .finally(() => setLoading(false));
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowModal(true);
    };

    const handleDelete = () => {
        UserService.deleteUser(deleteId)
            .then(() => {
                setMessage('Store Manager removed successfully.');
                fetchManagers(); // Refresh the list
                setShowModal(false);
            })
            .catch(err => {
                console.error(err);
                setMessage('Failed to delete user.');
                setShowModal(false);
            });
    };

    return (
        <Container className="mt-4 animate__animated animate__fadeIn">
            <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Manage Store Managers</h2>
            
            {message && <Alert variant="info" onClose={() => setMessage('')} dismissible>{message}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : managers.length === 0 ? (
                <div className="text-center py-5 shopease-table-container rounded border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <i className="bi bi-people fs-1" style={{ color: 'var(--text-muted)' }}></i>
                    <p className="mt-3 fw-semibold" style={{ color: 'var(--text-secondary)' }}>No store managers found.</p>
                </div>
            ) : (
                <div className="shopease-table-container">
                    <Table hover className="table-modern align-middle mb-0">
                        <thead style={{ backgroundColor: 'var(--surface-secondary)' }}>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {managers.map(user => (
                                <tr key={user.id}>
                                    <td className="fw-bold">{user.name || user.username}</td>
                                    <td>{user.email}</td>
                                    <td><Badge bg="info">STORE_MANAGER</Badge></td>
                                    <td className="text-end">
                                        <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(user.id)}>
                                            <i className="bi bi-trash"></i> Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Removal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this Store Manager? They will lose access immediately.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ManageStoreManagers;