import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';

const PendingApprovals = () => {
  const [pendingVisits, setPendingVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingVisits = async () => {
      try {
        const statusFilter = encodeURIComponent('approval pending');
        const response = await fetch(`http://localhost:5000/api/pending-visits/approval-pending`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});


        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const { visits } = await response.json();
        setPendingVisits(visits);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingVisits();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            color: '#ff9800',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Pending Approvals
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
              <CircularProgress />
            </Box>
          ) : pendingVisits.length === 0 ? (
            <Typography sx={{ textAlign: 'center', margin: '20px 0' }}>
              No pending approvals found
            </Typography>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {pendingVisits.map((visit) => (
                <ListItem 
                  key={visit._id} 
                  sx={{ 
                    border: '1px solid #eee', 
                    marginBottom: '10px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' }
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <ListItemText
                      primary={visit.place}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" display="block">
                            Officer: {visit.completedBy || 'Unassigned'}
                          </Typography>
                          <Typography component="span" variant="body2" display="block">
                            Location: {visit.location}
                          </Typography>
                          <Typography component="span" variant="body2" display="block">
                            Deadline: {formatDate(visit.deadline)}
                          </Typography>
                        </>
                      }
                    />
                  </Box>
                  <Box sx={{ 
                    marginTop: { xs: '10px', sm: 0 },
                    alignSelf: { xs: 'flex-end', sm: 'center' }
                  }}>
                    <Chip
                      label={visit.status}
                      color="warning"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <Button 
              variant="contained" 
              component={Link} 
              to="/dashboard"
              sx={{
                background: 'linear-gradient(90deg, #ff9800, #e65100)',
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

export default PendingApprovals;