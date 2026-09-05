import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import AdminService from '../../services/auth.service';

function PendingApprovals() {
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
    const [loadingAdmins, setLoadingAdmins] = useState(true);

    const fetchPendingAdmins = () => {
        setLoadingAdmins(true);
        AdminService.getPendingAdmins()
            .then(response => setPendingAdmins(response.data))
            .catch(error => setAdminMessage({ type: 'danger', text: "Error fetching pending admins." }))
            .finally(() => setLoadingAdmins(false));
    };

    useEffect(() => {
        fetchPendingAdmins();
    }, []);

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

    return (
        <div className="animate__animated animate__fadeIn">
            <h2 className="mb-4 text-primary fw-bold">Pending Stock Manager Approvals</h2>
            <Card className="custom-card mb-4 shadow-sm" style={{ border: '1px solid var(--border)' }}>
                <Card.Header as="h5" className="card-header-modern card-header-approvals">
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
                                <p style={{ color: 'var(--text-secondary)' }}>No pending approvals.</p>
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
        </div>
    );
}
export default PendingApprovals;