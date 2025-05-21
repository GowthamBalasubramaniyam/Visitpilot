import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Box,
    CircularProgress,
    Snackbar,
    Alert,
    Chip,
    Grid
} from '@mui/material';
import Navbar from './Navbar';
import VisitVerificationDialog from './VisitVerificationDialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { Replay } from '@mui/icons-material';
import EditVisitDialog from './EditVisitDialog';
const FieldVisitLog = ({ onLogout }) => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const navigate = useNavigate();
    const [verificationOpen, setVerificationOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "User";
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "User";
    const designation = user?.designation || "";
    const location = useLocation();
    const [filter, setFilter] = useState(location.state?.defaultFilter || 'all');
    // Navigation items configuration (same as Dashboard)
    const navItems = [
        { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'User'] },
        { label: 'Post Visit', path: '/post-visit', roles: ['Admin'] },
        { label: 'Field Visit Log', path: '/log-visit', roles: ['Admin', 'User'] },
        { label: 'Approve Reports', path: '/approve-reports', roles: ['Admin'] }
    ];

    // Filter navigation items based on user role
    const filteredNavItems = navItems.filter(item =>
        item.roles.map(r => r.toLowerCase()).includes(role.toLowerCase())
    );

    // Fetch visits from backend
    useEffect(() => {
        const fetchVisits = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');

                const response = await fetch('https://inspecton-management-backend.vercel.app/api/visits/pending', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to fetch visits');
                }

                const visitsData = result.visits || result.data || result || [];

                if (!Array.isArray(visitsData)) {
                    throw new Error('Received invalid data format from server');
                }

                let filteredVisits = [];
                // Filter visits by designation, unless it's "District Collector"
                if (designation === "District Collector") {
                    filteredVisits = visitsData; // Show all visits
                } else {
                    filteredVisits = visitsData.filter(visit => visit.postedTo === designation);
                }

                // Sort visits by createdAt date (newest first)
                const sortedVisits = [...filteredVisits].sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                setVisits(sortedVisits);
                setUserRole(user.role);

                if (sortedVisits.length === 0) {
                    const message = designation === "District Collector"
                        ? "No pending visits found."
                        : `No pending visits found for ${designation}`;
                    setSnackbar({
                        open: true,
                        message: message,
                        severity: 'info'
                    });
                }

            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
                setSnackbar({
                    open: true,
                    message: err.message || 'Failed to load visits',
                    severity: 'error'
                });
                setVisits([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, [designation, user.role]);

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleCompleteVisit = (visit) => {
    console.log('handleCompleteVisit called with:', visit);
    if (!visit) {
        console.error('No visit data provided');
        return;
    }
    setSelectedVisit(visit);
    if (userRole.toLowerCase() === 'admin') {
        setEditDialogOpen(true);
    } else {
        navigate(`/field-visit-report/${visit._id}?${
            new URLSearchParams({
                place: visit.place,
                deadline: visit.deadline,
                postedTo: visit.postedTo
            }).toString()
        }`);
    }
};

const handleSaveVisit = async (updatedData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://inspecton-management-backend.vercel.app/api/visits/${selectedVisit._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update visit');
        }

        // Update the local state with the updated visit
        setVisits(prevVisits => 
            prevVisits.map(visit => 
                visit._id === selectedVisit._id ? result.visit : visit
            )
        );

        return true;
    } catch (error) {
        console.error('Error updating visit:', error);
        throw error;
    }
};

    const handleVerificationComplete = (isVerified) => {
        setVerificationOpen(false);
        if (isVerified && selectedVisit) {
            navigate(`/field-visit-report/${selectedVisit._id}?${
                new URLSearchParams({
                    place: selectedVisit.place,
                    deadline: selectedVisit.deadline,
                    postedTo: selectedVisit.postedTo
                }).toString()
            }`);
        }
    };

    const handleRequestRepost = async (visitId) => {
        console.log(`Requesting repost for visit ID: ${visitId}`);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://inspecton-management-backend.vercel.app/api/visits/${visitId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'overdue' }),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to request repost';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    console.error("Error parsing error response", parseError);
                }
                throw new Error(errorMessage);
            }

            setSnackbar({
                open: true,
                message: 'Repost request sent successfully!',
                severity: 'success'
            });
            //fetchVisits();  // Removed this as it caused infinite loop.  The component re-renders on snackbar state change
        } catch (error) {
            console.error("Error requesting repost:", error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to request repost. Please try again.',
                severity: 'error'
            });
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #004ff9, #000000)',
                padding: '10px',
            }}
        >
            {/* Use the imported Navbar component */}
            <Navbar onLogout={onLogout} navItems={filteredNavItems} />

            {/* Field Visit List Content */}
            <Container maxWidth="md" sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0'
            }}>
                <Typography variant="h4" align="center" gutterBottom sx={{
                    fontWeight: 'bold',
                    color: '#4db5ff',
                    marginBottom: '30px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Pending Field Visits
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress size={60} sx={{ color: '#4db5ff' }} />
                    </Box>
                ) : error ? (
                    <Typography color="error" variant="h6" sx={{ textAlign: 'center' }}>
                        {error}
                    </Typography>
                ) : visits.length === 0 ? (
                    <Typography variant="h6" sx={{ color: '#e0e0e0', textAlign: 'center' }}>
                        {designation === "District Collector" ? "No pending visits found." : `No pending visits found for ${designation}`}
                    </Typography>
                ) : (
                    <Box sx={{ width: '100%', maxWidth: '800px' }}>
                        {visits.map((visit) => {
                            const isOverdue = new Date(visit.deadline) < new Date();
                            return (
                                <Card
                                    key={visit._id}
                                    sx={{
                                        width: '100%',
                                        mb: 3,
                                        background: 'linear-gradient(145deg, #1e1e2f, #2a2a3a)',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        {/* Header Section */}
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                            borderBottom: '1px solid #3a3a4d',
                                            pb: 2
                                        }}>
                                            <Typography variant="h6" sx={{
                                                color: '#4db5ff',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem'
                                            }}>
                                                {visit.place}
                                            </Typography>
                                            <Chip
                                                label={isOverdue ? 'OVERDUE' : 'PENDING'}
                                                sx={{
                                                    backgroundColor: isOverdue ? '#d32f2f' : '#FE9900',
                                                    color: '#fff',
                                                    fontWeight: 'bold'
                                                }}
                                                size="small"
                                            />
                                        </Box>

                                        {/* Details Grid */}
                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                                                    <Box component="span" sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>Location:</Box> {visit.location}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                                                    <Box component="span" sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>Posted To:</Box> {visit.postedTo}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                                                    <Box component="span" sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>Created:</Box>
                                                    {new Date(visit.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" sx={{
                                                    color: isOverdue ? '#ff6b6b' : '#a0a0a0',
                                                    fontWeight: isOverdue ? 'bold' : 'normal'
                                                }}>
                                                    <Box component="span" sx={{
                                                        color: isOverdue ? '#ff6b6b' : '#e0e0e0',
                                                        fontWeight: 'bold'
                                                    }}>Deadline:</Box>
                                                    {new Date(visit.deadline).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        {/* Instructions (if available) */}
                                        {visit.instructions && (
                                            <Box sx={{
                                                backgroundColor: '#2a2a3a',
                                                p: 2,
                                                borderRadius: '8px',
                                                mb: 2
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#a0a0a0',
                                                    fontStyle: 'italic'
                                                }}>
                                                    {visit.instructions}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Action Buttons */}
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            {isOverdue && userRole.toLowerCase() === 'user' ? (
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleRequestRepost(visit._id)}
                                                    sx={{
                                                        color: '#ff6b6b',
                                                        borderColor: '#ff6b6b',
                                                        fontWeight: 'bold',
                                                        height: '44px',
                                                        borderRadius: '8px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                                            color: '#ff6b6b',
                                                        },
                                                        flex: 1,
                                                        width: '100%'
                                                    }}
                                                >
                                                    <Replay sx={{ mr: 0.5, fontSize: '1rem' }} />
                                                    Request Repost
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleCompleteVisit(visit)}
                                                    disabled={isOverdue && userRole.toLowerCase() !== 'admin'} // Disable only for non-admins
                                                    sx={{
                                                        background: 'linear-gradient(90deg, #4db5ff, #005bb5)',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        fontWeight: 'bold',
                                                        height: '44px',
                                                        borderRadius: '8px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        color: '#fff',
                                                        '&:hover': {
                                                            background: 'linear-gradient(90deg, #3da5e5, #004a9a)',
                                                        },
                                                        '&:disabled': {
                                                            cursor: 'not-allowed',
                                                            opacity: 0.5,
                                                        },
                                                        flex: 1,
                                                        width: '100%'
                                                    }}
                                                >
                                                    {userRole.toLowerCase() === 'admin' ? 'Edit Visit' : 'Complete Visit'}
                                                </Button>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </Container>

            {/* Snackbar for error messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {selectedVisit && (
                <VisitVerificationDialog
                    open={verificationOpen}
                    onClose={() => {
                        console.log('Closing dialog');
                        setVerificationOpen(false);
                    }}
                    visit={selectedVisit}
                    onVerify={(isVerified) => {
                        console.log('Verification result:', isVerified);
                        handleVerificationComplete(isVerified);
                    }}
                />
            )}
{selectedVisit && userRole.toLowerCase() === 'admin' && (
    <EditVisitDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        visit={selectedVisit}
        onSave={handleSaveVisit}
    />
)}
        </Box>
    );
};

export default FieldVisitLog;