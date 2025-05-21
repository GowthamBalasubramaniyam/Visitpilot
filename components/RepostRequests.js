import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
} from '@mui/material';
import { Replay } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const RepostRequests = () => {
    const [overdueVisits, setOverdueVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const baseURL = 'http://localhost:5000';

    useEffect(() => {
        const fetchOverdueVisits = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get('/api/visits/overdue', {
                    baseURL: baseURL,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const visitsWithCalculations = response.data.map(visit => {
                    return {
                        ...visit,
                        daysOverdue: calculateDaysOverdue(visit.deadline),
                        formattedVisitDate: visit.visitDate ? format(new Date(visit.visitDate), 'PPP') : 'N/A',
                        formattedDueDate: visit.deadline ? format(new Date(visit.deadline), 'PPP') : 'N/A',
                        postedTo: visit.postedTo,
                        place: visit.place
                    };
                });
                setOverdueVisits(visitsWithCalculations);
            } catch (err) {
                console.error('API Error:', err);
                setError(err.response?.data?.message ||
                    err.message ||
                    'Failed to fetch overdue visits');
            } finally {
                setLoading(false);
            }
        };

        fetchOverdueVisits();
    }, []);

    const calculateDaysOverdue = (dueDate) => {
        if (!dueDate) return 'N/A';
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const handleRepost = async (visitId) => {
        try {
            const currentDate = new Date();
            const newDeadline = new Date(currentDate.setDate(currentDate.getDate() + 7)).toISOString();

            await axios.patch(`/api/visits/${visitId}/repost`, {
                deadline: newDeadline
            }, {
                baseURL: baseURL,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const response = await axios.get('/api/visits/overdue', {
                baseURL: baseURL,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const visitsWithCalculations = response.data.map(visit => {
                return {
                    ...visit,
                    daysOverdue: calculateDaysOverdue(visit.deadline),
                    formattedVisitDate: visit.visitDate ? format(new Date(visit.visitDate), 'PPP') : 'N/A',
                    formattedDueDate: visit.deadline ? format(new Date(visit.deadline), 'PPP') : 'N/A',
                    postedTo: visit.postedTo,
                    place: visit.place
                };
            });
            setOverdueVisits(visitsWithCalculations);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to repost visit');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"
                sx={{
                    background: 'linear-gradient(135deg, #004ff9, #000000)',
                    padding: '10px',
                }}
            >
                <CircularProgress sx={{ color: '#fff' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}
                sx={{
                    background: 'linear-gradient(135deg, #004ff9, #000000)',
                    minHeight: '100vh',
                    padding: '10px',
                }}
            >
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #004ff9, #000000)',
                padding: '10px',
            }}
        >
            <Box sx={{ padding: '0 20px' }}>
                <Typography variant="h4" color="white" mb={3}>Repost Requests</Typography>

                <TableContainer
                    component={Paper}
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        boxShadow: '0 5px 10px rgba(0, 0, 0, 0.15)',
                        mb: 3,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#001f4d' }}>
                                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Place</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Posted To</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Visit Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Due Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Days Overdue</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {overdueVisits.length > 0 ? (
                                overdueVisits.map((visit) => (
                                    <TableRow key={visit._id}>
                                        <TableCell>{visit.place}</TableCell>
                                        <TableCell>{visit.postedTo}</TableCell>
                                        <TableCell>{visit.formattedVisitDate}</TableCell>
                                        <TableCell>{visit.formattedDueDate}</TableCell>
                                        <TableCell>{visit.daysOverdue} days</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                startIcon={<Replay />}
                                                sx={{
                                                    color: '#e65100',
                                                    borderColor: '#e65100',
                                                    '&:hover': {
                                                        borderColor: '#bf360c',
                                                        backgroundColor: 'rgba(230, 81, 0, 0.08)'
                                                    }
                                                }}
                                                onClick={() => handleRepost(visit._id)}
                                            >
                                                Repost
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ fontStyle: 'italic', color: '#777' }}>
                                        No overdue visits found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Back Button at bottom of table container */}
                    <Box display="flex" justifyContent="center" p={2}>
                        <Button
                            variant="contained"
                            sx={{
                                background: '#e65100',
                                '&:hover': { background: '#bf360c' },
                                borderRadius: '8px',
                                padding: '10px 20px',
                            }}
                            onClick={() => navigate(-1)}
                        >
                            Back to Dashboard
                        </Button>
                    </Box>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default RepostRequests;
