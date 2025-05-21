import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { VerifiedUser, Refresh } from '@mui/icons-material';

const VisitVerificationDialog = ({ open, onClose, visit, onVerify }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [loadingVerification, setLoadingVerification] = useState(false);

  const handleInputChange = (event) => {
    setEmployeeId(event.target.value);
    setVerificationError('');
  };

  const handleRefresh = () => {
    setEmployeeId('');
    setVerificationError('');
  };

  const verifyEmployeeId = async () => {
    if (!employeeId) {
      setVerificationError('Please enter the Employee ID');
      return;
    }

    setLoadingVerification(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/visits/verify-employee?visitId=${visit._id}&employeeId=${employeeId}&requiredPosition=${visit.postedTo}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const result = await response.json();
      if (result?.success) {
        onVerify(true);
        onClose();
      } else {
        setVerificationError(result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError(error.message || 'An error occurred during verification');
    } finally {
      setLoadingVerification(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          background: 'linear-gradient(145deg, #1e1e2f, #2a2a3a)',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(77, 181, 255, 0.2)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#001f4d', 
        color: '#4db5ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VerifiedUser />
          <Box>
            Verify {visit?.postedTo} ID
          </Box>
        </Box>
        <Tooltip title="Refresh">
          <IconButton 
            onClick={handleRefresh}
            sx={{ 
              color: '#ffffff', // Changed to bright white
              '&:hover': { 
                color: '#4db5ff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Refresh sx={{ fontSize: '1.3rem' }} /> {/* Slightly larger icon */}
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ 
        py: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        paddingTop: '24px',
        paddingBottom: '24px'
      }}>
        <Box sx={{ height: '20px' }} />
        
        <TextField
          fullWidth
          variant="outlined"
          label={`Enter ${visit?.postedTo} Employee ID`}
          value={employeeId}
          onChange={handleInputChange}
          error={!!verificationError}
          helperText={verificationError}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '& fieldset': {
                borderColor: '#3a3a4d',
              },
              '&:hover fieldset': {
                borderColor: '#4db5ff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4db5ff',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a0a0a0',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#4db5ff',
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',
            }
          }}
        />

        {verificationError && (
          <Alert 
            severity="error" 
            sx={{ 
              bgcolor: 'rgba(211, 47, 47, 0.1)',
              color: '#ff6b6b',
              border: '1px solid rgba(211, 47, 47, 0.3)'
            }}
          >
            {verificationError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2,
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '8px',
            px: 3,
            textTransform: 'none',
            color: '#e0e0e0',
            borderColor: '#3a3a4d',
            '&:hover': {
              borderColor: '#4db5ff',
              color: '#4db5ff'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={verifyEmployeeId}
          variant="contained"
          disabled={loadingVerification}
          sx={{
            borderRadius: '8px',
            px: 3,
            textTransform: 'none',
            background: 'linear-gradient(90deg, #4db5ff, #005bb5)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(90deg, #3da5e5, #004a9a)',
            },
            '&.Mui-disabled': {
              background: '#3a3a4d',
              color: '#a0a0a0'
            }
          }}
          startIcon={loadingVerification ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loadingVerification ? 'Verifying...' : 'Verify'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitVerificationDialog;