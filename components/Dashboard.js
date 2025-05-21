import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    AccountCircle,
    Settings,
    ExitToApp,
    ListAlt,
    PendingActions,
    AssignmentTurnedIn,
    Replay,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Dashboard = ({ onLogout }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [username, setUsername] = useState('User');
    const [role, setRole] = useState('User');
    const [designation, setDesignation] = useState('');
    const [dashboardStats, setDashboardStats] = useState({
        totalVisits: 0,
        pendingApprovals: 0,
        approvedReports: 0,
        repostRequests: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

useEffect(() => {
    const loadUserData = async () => {
        try {
            // Load user data first
            const storedUserString = localStorage.getItem('user');
            let userData = {};
            
            if (storedUserString) {
                userData = JSON.parse(storedUserString);
                setUsername(userData.username || 'User');

                if (userData?.role) {
                    const formattedRole = userData.role.charAt(0).toUpperCase() +
                        userData.role.slice(1).toLowerCase();
                    setRole(formattedRole);
                }

                if (userData?.designation) {
                    setDesignation(userData.designation);
                }
            }

            const token = localStorage.getItem('token');
            let endpoint = 'http://localhost:5000/api/visits/counts';
            
            // For non-admin users, use their designation from the just-loaded user data
            if (userData.role && userData.role.toLowerCase() !== 'admin' && userData.designation) {
                endpoint = `http://localhost:5000/api/visits/counts?designation=${encodeURIComponent(userData.designation)}`;
            }

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch visit counts');
            }

            const counts = await response.json();
            setDashboardStats({
                totalVisits: counts.totalVisits || 0,
                pendingApprovals: counts.pendingApprovals || 0,
                approvedReports: counts.approvedReports || 0,
                repostRequests: counts.repostRequests || 0
            });
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    loadUserData();
}, []); // Removed dependencies to prevent multiple triggers

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const getAbbreviatedDesignation = (fullDesignation) => {
        if (!fullDesignation) return '';

        const abbreviationMap = {
            'Revenue Divisional Officer (RDO)': 'RDO',
            'Tahsildar': 'TAH',
            'Block Development Officer (BDO)': 'BDO',
            'Chief/District Educational Officer (CEO/DEO)': 'EDU',
            'Deputy Director of Health Services (DDHS)': 'DDHS',
            'District Social Welfare Officer (DSWO)': 'DSWO',
            'Executive Engineer (PWD/Highways/Rural Dev)': 'ENG',
            'District Supply Officer (DSO)': 'DSO',
            'District Collector': 'IAS',
        };

        return abbreviationMap[fullDesignation] || fullDesignation;
    };

    const handleRepostClick = () => {
        navigate('/repost-visits');
    };

    // Navigation items configuration
    const navItems = [
        { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'User'] },
        { label: 'Post Visit', path: '/post-visit', roles: ['Admin'] },
        { label: 'Field Visit Log', path: '/log-visit', roles: ['Admin', 'User'] },
        { label: 'Approve Reports', path: '/approve-reports', roles: ['Admin'] },
    ];

    // Filter navigation items based on user role
    const filteredNavItems = navItems.filter(item =>
        item.roles.map(r => r.toLowerCase()).includes(role.toLowerCase())
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #004ff9, #000000)',
                padding: '10px',
            }}
        >
            {/* Navigation Bar */}
            <Navbar onLogout={onLogout} navItems={filteredNavItems} />

            {/* Dashboard Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #003366, #0066cc)',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                    textAlign: 'center',
                    marginBottom: '25px',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                    }}
                >
                    Dashboard Overview
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: '#d0d0d0',
                        marginTop: '12px',
                        fontStyle: 'italic',
                        fontSize: '18px',
                    }}
                >
                    Welcome back, {username} ({designation})
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress size={60} sx={{ color: '#4db5ff' }} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ margin: '20px' }}>
                    {error}
                </Alert>
            ) : (
                <Grid container spacing={3} sx={{ padding: '0 20px' }}>
                    {/* Total Visits - Shows visits for user's designation */}
                    <Grid item xs={12} sm={6} md={role.toLowerCase() === 'admin' ? 3 : 6}>
                        <StatCard
                            title={role.toLowerCase() === 'admin' ? "Total Visits" : `Your Visits`}
                            value={dashboardStats.totalVisits}
                            icon={<ListAlt fontSize="large" sx={{ color: '#1976d2' }} />}
                            color="#1976d2"
                            onClick={() => navigate('/total-visits')}
                        />
                    </Grid>

                    {/* Pending Approvals - Shows approvals for user's designation */}
<Grid item xs={12} sm={6} md={role.toLowerCase() === 'admin' ? 3 : 6}>
    <StatCard
        title={role.toLowerCase() === 'admin' ? "Pending Approvals" : `Your Pending`}
        value={dashboardStats.pendingApprovals}
        icon={<PendingActions fontSize="large" sx={{ color: '#ff9800' }} />}
        color="#ff9800"
        onClick={() => {
            if (role.toLowerCase() === 'admin') {
                navigate('/pending-approvals');
            } else {
                navigate('/log-visit', { 
                    state: { defaultFilter: 'pending' } 
                });
            }
        }}
    />
</Grid>

                    {/* Approved Reports - Only show for Admin */}
                    {role.toLowerCase() === 'admin' && (
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Approved Reports"
                                value={dashboardStats.approvedReports}
                                icon={<AssignmentTurnedIn fontSize="large" sx={{ color: '#4caf50' }} />}
                                color="#4caf50"
                                onClick={() => navigate('/approved-reports')}
                            />
                        </Grid>
                    )}

                    {/* Repost Requests - Only show for Admin */}
                    {role.toLowerCase() === 'admin' && (
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Repost Requests"
                                value={dashboardStats.repostRequests}
                                icon={<Replay fontSize="large" sx={{ color: '#e65100' }} />}
                                color="#e65100"
                                onClick={() => navigate('/repost-requests')}
                            />
                        </Grid>
                    )}
                </Grid>
            )}
        </Box>
    );
};

const StatCard = ({ title, value, icon, color, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
    >
        <Card
            onClick={onClick}
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                boxShadow: '0 5px 10px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    cursor: 'pointer',
                },
            }}
        >
            <CardContent sx={{ textAlign: 'center', padding: '30px' }}>
                {icon}
                <Typography
                    variant="h6"
                    sx={{
                        color: color,
                        fontWeight: 'bold',
                        marginBottom: '12px',
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="h3"
                    sx={{
                        color: '#333',
                        fontWeight: 'bold',
                    }}
                >
                    {value}
                </Typography>
            </CardContent>
        </Card>
    </motion.div>
);

export default Dashboard;