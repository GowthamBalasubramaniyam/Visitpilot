import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import Navbar from './Navbar'; // Import the Navbar component

const ReportApproval = ({ onLogout }) => {
  const [username, setUsername] = useState('User');
  const [role, setRole] = useState('User');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Navigation items configuration
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'User'] },
    { label: 'Post Visit', path: '/post-visit', roles: ['Admin'] },
    { label: 'Field Visit Log', path: '/log-visit', roles: ['Admin', 'User'] },
    { label: 'Approve Reports', path: '/approve-reports', roles: ['Admin'] }
  ];

  // Load user data and reports
  useEffect(() => {
    const loadUserData = () => {
      const storedUserString = localStorage.getItem('user');
      if (storedUserString) {
        try {
          const storedUser = JSON.parse(storedUserString);
          setUsername(storedUser.username || 'User');
          
          if (storedUser?.role) {
            const formattedRole = storedUser.role.charAt(0).toUpperCase() + 
                                 storedUser.role.slice(1).toLowerCase();
            setRole(formattedRole);
          }
        } catch (error) {
          console.error('Failed to load user:', error);
        }
      }
    };

    const fetchSubmittedVisits = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/submitted-visits', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        setReports(data.visits);
        
      } catch (err) {
        console.error('Fetch error details:', {
          error: err,
          message: err.message,
          stack: err.stack
        });
        
        setSnackbar({
          open: true,
          message: `Failed to load visits: ${err.message}`,
          severity: 'error'
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    fetchSubmittedVisits();
  }, []);

  const handleApprove = async (visitId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/submitted-visits/approve/${visitId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to approve visit');
      }

      setReports(reports.map(report => 
        report._id === visitId ? { ...report, status: 'Approved' } : report
      ));

      setSnackbar({
        open: true,
        message: 'Visit approved successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Approval error:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to approve visit',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #004ff9, #000000)', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px'
    }}>
      {/* Use the imported Navbar component */}
      <Navbar onLogout={onLogout} navItems={navItems} />

      {/* Report Approval Table Content */}
      <Box sx={{ padding: '20px', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress size={60} sx={{ color: '#4db5ff' }} />
          </Box>
        ) : error ? (
          <Typography color="error" variant="h6" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: '#f9f9f9',
              maxWidth: '1000px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#001f4d' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Completed By</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Place</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Submitted At</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>{report.completedBy || 'N/A'}</TableCell>
                      <TableCell>{report.place || 'N/A'}</TableCell>
                      <TableCell>{report.location || 'N/A'}</TableCell>
                      <TableCell sx={{ 
                        color: report.status === 'Approved' ? '#4caf50' : 
                               report.status === 'Rejected' ? '#f44336' : '#ff9800',
                        fontWeight: 'bold'
                      }}>
                        {report.status || 'Not Specified'}
                      </TableCell>
                      <TableCell>
                        {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          component={Link}
                          to={`/visit-details/${report._id}`}
                          sx={{ mr: 1 }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
                      No submitted visits found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Snackbar for notifications */}
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
    </Box>
  );
};

export default ReportApproval;