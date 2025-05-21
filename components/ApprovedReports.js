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
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';

const ApprovedReports = () => {
  const [approvedVisits, setApprovedVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedVisits = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/approved-visits`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const { visits } = await response.json();
        setApprovedVisits(visits);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedVisits();
  }, []);

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
            color: '#4caf50',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Approved Reports
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: 'center', margin: '20px 0' }}>
              Error: {error}
            </Typography>
          ) : approvedVisits.length === 0 ? (
            <Typography sx={{ textAlign: 'center', margin: '20px 0' }}>
              No approved reports found
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="approved visits table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Place</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Officer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    {/* Removed Date Approved column */}
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvedVisits.map((visit) => (
                    <TableRow key={visit._id}>
                      <TableCell>{visit.place}</TableCell>
                      <TableCell>{visit.completedBy || 'Unassigned'}</TableCell>
                      <TableCell>{visit.location}</TableCell>
                      {/* Removed Date Approved cell */}
                      <TableCell>
                        <Chip 
                          label={visit.status} 
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          color="primary"
                          component={Link}
                          to={`/visit-details/${visit._id}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <Button 
              variant="contained" 
              component={Link} 
              to="/dashboard"
              sx={{
                background: 'linear-gradient(90deg, #4caf50, #2e7d32)',
                fontWeight: 'bold',
                padding: '10px 30px'
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

export default ApprovedReports;
