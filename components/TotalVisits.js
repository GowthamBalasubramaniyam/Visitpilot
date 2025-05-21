import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress,
  Chip,
  TablePagination,
  Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const TotalVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalVisits, setTotalVisits] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        if (!user) return;

        let url = `http://localhost:5000/api/visits?page=${page + 1}&limit=${rowsPerPage}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch visits');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch visits');
        }

        setVisits(data.visits);
        setTotalVisits(data.total);
        setLoading(false);
      } catch (err) {
        console.error("Visit fetch error:", err);
        setError(err.message || 'An error occurred while fetching visits');
        setLoading(false);
      }
    };

    fetchVisits();
  }, [page, rowsPerPage, user]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusChip = (status, isOverdue) => {
    const statusConfig = {
      submitted: {
  icon: <CheckCircleIcon fontSize="small" />,
  color: 'success',
  label: 'Submitted'
},

      approved: {
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
        label: 'Approved'
      },
      overdue: {
        icon: <ErrorIcon fontSize="small" />,
        color: 'error',
        label: 'Overdue'
      },
      pending: {
        icon: isOverdue ? <ErrorIcon fontSize="small" /> : <AccessTimeIcon fontSize="small" />,
        color: isOverdue ? 'error' : 'warning',
        label: isOverdue ? 'Overdue' : 'Pending'
      },
      rejected: {
        icon: <WarningIcon fontSize="small" />,
        color: 'error',
        label: 'Rejected'
      }
    };

    const config = statusConfig[status] || {
      icon: <WarningIcon fontSize="small" />,
      color: 'default',
      label: status || 'Unknown'
    };

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant="outlined"
        size="small"
        sx={{ fontWeight: 'bold', minWidth: 100 }}
      />
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #004ff9, #000000)',
      padding: '20px'
    }}>
      <Container maxWidth="lg">
        <Box sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
          marginTop: '20px'
        }}>
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            color: '#1976d2',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {user?.role.toLowerCase() === 'admin' ? 'Total Visits Overview' : 'Your Assigned Visits'}
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
              <CircularProgress size={60} />
              <Typography sx={{ ml: 2 }}>Loading visits...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{
              backgroundColor: '#ffeeee',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              margin: '20px 0'
            }}>
              <Typography color="error" variant="h6">Error Loading Visits</Typography>
              <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
              <Button variant="contained" color="error" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body1" sx={{ marginBottom: '20px' }}>
                {user?.role.toLowerCase() === 'admin'
                  ? `Showing ${visits.length} of ${totalVisits} field visits in the system.`
                  : `Showing ${visits.length} visits assigned to ${user?.designation || 'you'}.`}
              </Typography>

              <TableContainer component={Paper} sx={{ marginBottom: '20px' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#1976d2' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Place</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                      {user?.role.toLowerCase() === 'admin' && (
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Assigned To</TableCell>
                      )}
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Deadline</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visits.length > 0 ? (
                      visits.map((visit) => (
                        <TableRow key={visit._id} hover>
                          <TableCell>
                            <Tooltip title={visit.instructions || 'No instructions'}>
                              <span>{visit.place}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{visit.location}</TableCell>
                          {user?.role.toLowerCase() === 'admin' && (
                            <TableCell>{visit.postedTo || 'Unassigned'}</TableCell>
                          )}
                          <TableCell>{formatDate(visit.deadline)}</TableCell>
                          <TableCell>
                            {getStatusChip(visit.status, visit.isOverdue)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={user?.role.toLowerCase() === 'admin' ? 5 : 4} align="center">
                          <Typography variant="body1" color="textSecondary">
                            No visits found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalVisits > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalVisits}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    '& .MuiTablePagination-toolbar': {
                      justifyContent: 'center'
                    }
                  }}
                />
              )}
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <Button
              variant="contained"
              component={Link}
              to="/dashboard"
              sx={{
                background: 'linear-gradient(90deg, #1976d2, #004ba0)',
                fontWeight: 'bold',
                padding: '10px 30px',
                '&:hover': {
                  background: 'linear-gradient(90deg, #004ba0, #1976d2)'
                }
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TotalVisits;