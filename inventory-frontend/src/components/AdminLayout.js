import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Spinner, InputGroup, Form, Badge, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import NotificationService from '../services/notification.service'; 

const AdminLayout = () => {
    const location = useLocation();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username') || localStorage.getItem('email') || 'Admin User';
    const userInitials = username.includes(' ')
        ? username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : username.substring(0, 2).toUpperCase();
    
    const [unreadCount, setUnreadCount] = useState(0); 
    const [isDataReady, setIsDataReady] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return window.innerWidth < 1024; // Collapsed by default on tablet and mobile
    });
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('admin-theme') === 'dark';
    });

    // Handle responsive resize collapsing
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    const sidebarTitle = role === 'ROLE_ADMIN' ? 'Admin Panel' : 'Store Manager';

    // Theme Switch Effect
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('admin-theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('admin-theme', 'light');
        }
        window.dispatchEvent(new CustomEvent('themechange'));
    }, [darkMode]);

    // Handle outside clicks to close notification dropdown
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.notification-bell-container')) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    const fetchNotificationsList = () => {
        NotificationService.getAllNotifications()
            .then(res => {
                // Get the top 4 unread/latest notifications
                setNotifications(res.data.slice(0, 4));
            })
            .catch(err => console.error("Error fetching notifications list", err));
    };

    const startPolling = () => {
        const fetchAll = () => {
            NotificationService.getUnreadCount()
                .then(res => {
                    setUnreadCount(res.data);
                    setIsDataReady(true);
                })
                .catch(err => {
                     console.error("Auth check failed", err);
                     setIsDataReady(true);
                     setUnreadCount(0);
                });
            fetchNotificationsList();
        };

        fetchAll();

        const interval = setInterval(() => {
            fetchAll();
        }, 5000);

        return () => clearInterval(interval);
    };
    
    useEffect(() => {
        const cleanup = startPolling();
        return cleanup;
    }, []);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        let dateObj;
        if (Array.isArray(timestamp)) {
            const [year, month, day, hour, minute, second] = timestamp;
            dateObj = new Date(year, month - 1, day, hour, minute, second || 0);
        } else {
            dateObj = new Date(timestamp);
        }
        if (isNaN(dateObj.getTime())) return 'N/A';
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Dismiss single notification from dropdown
    const handleDismissFromDropdown = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        NotificationService.markAsRead(id)
            .then(() => {
                fetchNotificationsList();
                NotificationService.getUnreadCount().then(res => setUnreadCount(res.data));
            })
            .catch(err => console.error("Error dismissing notification from dropdown", err));
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length === 0) return;

        Promise.all(unreadIds.map(id => NotificationService.markAsRead(id)))
            .then(() => {
                fetchNotificationsList();
                NotificationService.getUnreadCount().then(res => setUnreadCount(res.data));
            })
            .catch(err => console.error("Error marking all as read", err));
    };

    // Dynamic breadcrumb labels
    const getCurrentPageName = () => {
        const path = location.pathname;
        if (path === '/admin') return 'Overview';
        if (path === '/admin/alerts') return 'Alerts';
        if (path === '/admin/products') return 'Products';
        if (path === '/admin/transactions') return 'Transactions';
        if (path === '/admin/analytics') return 'Analytics';
        if (path === '/admin/approvals') return 'Approvals';
        if (path === '/admin/forecasting') return 'Forecasting';
        if (path === '/admin/restock') return 'Restock';
        if (path === '/admin/managers') return 'Store Managers';
        return 'Overview';
    };

    // Logout
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // Define Grouped Navigation Items
    const groups = [
        {
            title: 'Management',
            items: [
                { path: '/admin/alerts', name: 'Alerts', icon: 'bi-bell-fill', hasBadge: true },
                ...(role === 'ROLE_ADMIN' ? [{ path: '/admin', name: 'Overview', icon: 'bi-grid-1x2-fill' }] : []),
                { path: '/admin/products', name: 'Products', icon: 'bi-boxes' }
            ]
        },
        {
            title: 'Operations',
            items: [
                { path: '/admin/transactions', name: 'Transactions', icon: 'bi-arrow-left-right' },
                { path: '/admin/analytics', name: 'Analytics', icon: 'bi-bar-chart-line-fill' },
                ...(role === 'ROLE_ADMIN' ? [{ path: '/admin/approvals', name: 'Approvals', icon: 'bi-person-check-fill' }] : [])
            ]
        },
        ...(role === 'ROLE_ADMIN' ? [{
            title: 'Inventory',
            items: [
                { path: '/admin/forecasting', name: 'Forecasting', icon: 'bi-graph-up-arrow' },
                { path: '/admin/restock', name: 'Restock', icon: 'bi-truck' },
                { path: '/admin/managers', name: 'Store Managers', icon: 'bi-people-fill' }
            ]
        }] : []),
        {
            title: 'Settings',
            items: [
                { path: '#', name: 'Settings', icon: 'bi-gear-fill' },
                { path: '#', name: 'Support', icon: 'bi-chat-left-dots-fill' }
            ]
        }
    ];

    const renderSidebarLink = (item) => {
        const isAlert = item.path === '/admin/alerts';
        
        const linkContent = (
            <Link 
                key={item.path} 
                to={item.path} 
                className={`sidebar-nav-link ${isActive(item.path) ? 'active' : ''} ${isAlert ? 'alerts-link' : ''}`}
            >
                <i className={`bi ${item.icon} me-3`} style={{ fontSize: '1.1rem' }}></i>
                <span className="sidebar-label">{item.name}</span>
                {isAlert && unreadCount > 0 && (
                    <Badge bg="danger" className="ms-auto sidebar-badge rounded-pill px-2">
                        {unreadCount}
                    </Badge>
                )}
            </Link>
        );

        if (isCollapsed) {
            return (
                <OverlayTrigger 
                    key={item.path} 
                    placement="right" 
                    overlay={<Tooltip id={`tooltip-${item.name}`}>{item.name}</Tooltip>}
                >
                    {linkContent}
                </OverlayTrigger>
            );
        }

        return linkContent;
    };

    if (!isDataReady) {
        return (
            <div className="text-center p-5 mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading Security & Data...</p>
            </div>
        );
    }

    return (
        <div className="shopease-admin-wrapper">
            {/* Mobile Sidebar backdrop */}
            {!isCollapsed && (
                <div 
                    className="shopease-sidebar-backdrop d-md-none" 
                    onClick={() => setIsCollapsed(true)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`shopease-sidebar ${isCollapsed ? 'collapsed' : 'mobile-open'}`}>
                <div className="shopease-sidebar-brand">
                    <h5 className="mb-0 text-white fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-bag-heart-fill text-primary" style={{ fontSize: '1.4rem' }}></i>
                        <span className="sidebar-brand-text">ShopEase</span>
                    </h5>
                    {!isCollapsed && (
                        <button 
                            className="btn btn-link text-muted p-0 border-0" 
                            onClick={() => setIsCollapsed(true)}
                        >
                            <i className="bi bi-chevron-left" style={{ fontSize: '1.2rem' }}></i>
                        </button>
                    )}
                </div>

                <div className="flex-grow-1 overflow-auto py-3">
                    {groups.map(group => (
                        <div key={group.title} className="mb-4">
                            <div className="sidebar-section-title">{group.title}</div>
                            <Nav className="flex-column gap-1">
                                {group.items.map(item => renderSidebarLink(item))}
                            </Nav>
                        </div>
                    ))}
                </div>

                {/* Sidebar collapsed toggle at bottom if collapsed */}
                {isCollapsed && (
                    <div className="p-3 text-center border-top border-secondary">
                        <button 
                            className="btn btn-link text-muted p-0 border-0" 
                            onClick={() => setIsCollapsed(false)}
                        >
                            <i className="bi bi-chevron-right" style={{ fontSize: '1.2rem' }}></i>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className={`shopease-main-content-wrapper flex-grow-1 d-flex flex-column ${isCollapsed ? 'sidebar-collapsed' : ''}`} style={{ minWidth: 0 }}>
                {/* Header */}
                <div className="shopease-admin-header">
                    <div className="d-flex align-items-center gap-3">
                        {isCollapsed && (
                            <button 
                                className="btn btn-link text-muted p-0 border-0" 
                                onClick={() => setIsCollapsed(false)}
                            >
                                <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
                            </button>
                        )}
                        {!isCollapsed && (
                            <button 
                                className="btn btn-link text-muted p-0 border-0 d-md-none" 
                                onClick={() => setIsCollapsed(true)}
                            >
                                <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
                            </button>
                        )}

                        {/* Search bar */}
                        <InputGroup size="sm" style={{ width: '280px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }} className="d-none d-md-flex bg-light">
                            <InputGroup.Text className="bg-transparent border-0 text-muted">
                                <i className="bi bi-search"></i>
                            </InputGroup.Text>
                            <Form.Control 
                                placeholder="Search for orders, products..." 
                                className="bg-transparent border-0 small px-0"
                            />
                        </InputGroup>

                        {/* Breadcrumbs */}
                        <div className="shopease-breadcrumb ms-3 d-none d-lg-flex">
                            <span className="breadcrumb-parent">Admin Panel</span>
                            <span className="breadcrumb-separator">/</span>
                            <span className="breadcrumb-current">{getCurrentPageName()}</span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-4">
                        {/* Dark/Light mode switch */}
                        <div className="d-flex align-items-center gap-2">
                            <i className={`bi ${darkMode ? 'bi-moon-stars-fill text-warning' : 'bi-sun-fill text-primary'}`} style={{ fontSize: '0.95rem' }}></i>
                            <label className="theme-toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={darkMode} 
                                    onChange={() => setDarkMode(!darkMode)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        {/* Notification Bell Dropdown */}
                        <div className="notification-bell-container">
                            <button 
                                className="btn btn-link p-0 text-muted border-0 position-relative"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <i className="bi bi-bell-fill" style={{ fontSize: '1.3rem' }}></i>
                                {unreadCount > 0 && (
                                    <span className="badge bg-danger notification-bell-badge">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="notification-bell-dropdown">
                                    <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
                                        <strong className="text-primary-theme">Notifications</strong>
                                        {unreadCount > 0 && (
                                            <a 
                                                href="#mark-all" 
                                                onClick={handleMarkAllAsRead} 
                                                className="text-primary small text-decoration-none fw-bold"
                                            >
                                                Mark all as read
                                            </a>
                                        )}
                                    </div>
                                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-muted small">No recent notifications.</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div 
                                                    key={n.id} 
                                                    className="notification-dropdown-item d-flex align-items-start gap-2.5"
                                                    style={{ opacity: n.isRead ? 0.6 : 1 }}
                                                >
                                                    <div className="d-flex flex-column text-start flex-grow-1">
                                                        <span className="fw-semibold small">{n.message}</span>
                                                        <span className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                                                            {formatTime(n.createdAt)}
                                                        </span>
                                                    </div>
                                                    {!n.isRead && (
                                                        <button 
                                                            className="btn btn-link p-0 border-0 text-danger small ms-auto align-self-center"
                                                            onClick={(e) => handleDismissFromDropdown(e, n.id)}
                                                        >
                                                            <i className="bi bi-x-circle-fill"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-2 border-top bg-light text-center">
                                        <Link 
                                            to="/admin/alerts" 
                                            className="text-primary small text-decoration-none fw-bold d-block py-1"
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            Show all notifications <i className="bi bi-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <Dropdown align="end">
                            <Dropdown.Toggle as="div" className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '38px', height: '38px', border: '2px solid rgba(59, 130, 246, 0.15)' }}>
                                    {userInitials}
                                </div>
                                <div className="text-start d-none d-sm-block">
                                    <div className="fw-bold small" style={{ lineHeight: '1.2' }}>{username}</div>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                        {role === 'ROLE_ADMIN' ? 'Administrator' : 'Store Manager'}
                                    </div>
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="shadow border-0 mt-2" style={{ borderRadius: '12px' }}>
                                <Dropdown.Item as={Link} to="/admin" className="small py-2"><i className="bi bi-grid me-2"></i> Dashboard</Dropdown.Item>
                                <Dropdown.Item as={Link} to="/admin/alerts" className="small py-2"><i className="bi bi-bell me-2"></i> Alerts</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout} className="text-danger small py-2"><i className="bi bi-box-arrow-right me-2"></i> Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {/* Main Content Body */}
                <div className="flex-grow-1 p-4 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;