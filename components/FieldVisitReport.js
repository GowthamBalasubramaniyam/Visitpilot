import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box
} from '@mui/material';
import { AccountCircle, Settings, ExitToApp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const BACKEND_URL = 'http://localhost:5000';

const FieldVisitReport = ({ onLogout }) => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const urlLocation = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user?.username || 'User';
  const role = user?.role || 'user';
  const initials = username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();

  // Form state with only required fields
  const [formData, setFormData] = useState({
  place: '',
  location: '',
  photos: [],
  deadline: '',  // Will be populated from URL
  postedTo: '',
  report: ''    // Will be populated from URL
});

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_KEY = '971b492f5c5a4d52b0d56a767fabb428';

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
  const searchParams = new URLSearchParams(urlLocation.search);

  const placeFromParams = searchParams.get('place');
  const deadlineFromParams = searchParams.get('deadline');
  const postedToFromParams = searchParams.get('postedTo');

  setFormData(prev => ({
    ...prev,
    place: placeFromParams ? decodeURIComponent(placeFromParams) : prev.place,
    deadline: deadlineFromParams || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    postedTo: postedToFromParams || user?.department || 'General'
  }));

  if (!placeFromParams) {
    setSnackbar({
      open: true,
      message: 'Required parameters not found in URL.',
      severity: 'warning'
    });
  }
}, [urlLocation.search, visitId, user?.department]);


  const fetchLocation = () => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
console.log('Raw coordinates:', position.coords.latitude, position.coords.longitude);
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
            );
console.log(response.data);
            const address = response.data.results[0].formatted;
            setFormData(prev => ({ ...prev, location: address }));
          } catch (error) {
            setSnackbar({
              open: true,
              message: 'Unable to fetch location details.',
              severity: 'error'
            });
          } finally {
            setIsFetchingLocation(false);
          }
        },
        () => {
          setSnackbar({
            open: true,
            message: 'Unable to fetch your location.',
            severity: 'error'
          });
          setIsFetchingLocation(false);
        }
      );
    }
  };

  const handlePhotoUpload = (e) => {
    const files = e.target.files;
    if (files.length + formData.photos.length > 5) {
      setSnackbar({
        open: true,
        message: 'You can upload up to 5 photos only.',
        severity: 'warning',
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...Array.from(files)]
    }));
  };

  const handleSubmit = async () => {
  if (!formData.location || !formData.deadline || !formData.postedTo|| !formData.report) {
    setSnackbar({
      open: true,
      message: 'Please ensure all required fields are filled.',
      severity: 'warning',
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const token = localStorage.getItem('token');
    const submitData = new FormData();
    
    // Append all fields including deadline and postedTo
    submitData.append('place', formData.place);
    submitData.append('location', formData.location);
    submitData.append('deadline', new Date(formData.deadline).toISOString());
    submitData.append('postedTo', formData.postedTo);
    submitData.append('report', formData.report);       
    submitData.append('userId', user?._id);
    submitData.append('username', username);
    
    // ✅ Add visitId here
    submitData.append('visitId', visitId); // Add the visitId parameter

    // Append photos
    formData.photos.forEach(photo => {
      submitData.append('photos', photo);
    });

    // Make the POST request
    const response = await axios.post(
      `${BACKEND_URL}/api/visits/submit`,
      submitData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000
      }
    );

    // Check response and handle accordingly
    if (response.data.success) {
      setSnackbar({
        open: true,
        message: 'Visit submitted successfully!',
        severity: 'success',
      });

      // ✅ Delay redirect to let Snackbar show
      setTimeout(() => {
        navigate('/log-visit');
      }, 2000); // Wait 2 seconds before redirect
    } else {
      throw new Error(response.data.message || 'Submission failed');
    }
  } catch (error) {
    console.error('Submission error:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || 'Failed to submit visit. Please try again.',
      severity: 'error',
    });
  } finally {
    setIsSubmitting(false);
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
      {/* Navigation Bar (unchanged) */}
      <AppBar position="static" sx={{
        background: '#001f4d',
        marginBottom: '20px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        borderRadius: '8px'
      }}>
        {/* ... (keep existing AppBar code) ... */}
      </AppBar>

      {/* Field Visit Report Form */}
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              padding: '30px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              backgroundColor: '#1e1e2f',
              color: '#fff',
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ fontWeight: 'bold', color: '#4db5ff', marginBottom: '20px' }}
              >
                Complete Field Visit
              </Typography>

              {/* Place Field */}
              <TextField
                label="Place"
                fullWidth
                value={formData.place}
                disabled
                variant="outlined"
                InputProps={{
                  style: {
                    color: '#a0a0a0',
                    WebkitTextFillColor: '#a0a0a0 !important'
                  }
                }}
                InputLabelProps={{
                  style: { color: '#ffffff' },
                  shrink: true
                }}
                sx={{
                  border: '1px solid #4db5ff',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  backgroundColor: '#3a3a4d',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      borderColor: '#4db5ff',
                      boxShadow: '0 0 0 2px rgba(77, 181, 255, 0.3)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(77, 181, 255, 0.5)',
                    },
                    height: '48px',
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: '#a0a0a0'
                  },
                }}
              />

              {/* Location Field */}
              <TextField
                label="Location"
                fullWidth
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                variant="outlined"
                InputProps={{
                  style: { color: '#a0a0a0' },
                  readOnly: true
                }}
                InputLabelProps={{
                  style: { color: '#ffffff' },
                  shrink: true
                }}
                sx={{
                  border: '1px solid #4db5ff',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  backgroundColor: '#3a3a4d',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      borderColor: '#4db5ff',
                      boxShadow: '0 0 0 2px rgba(77, 181, 255, 0.3)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(77, 181, 255, 0.5)',
                    },
                    height: '48px',
                    input: {
                      '&::placeholder': {
                        color: '#a0a0a0',
                      }
                    },
                  },
                }}
                placeholder="Click 'Get Current Location' to fetch live location"
              />
            {/* Report Field */}
<TextField
  label="Report"
  fullWidth
  multiline
  rows={4}
  value={formData.report}
  onChange={(e) => setFormData({...formData, report: e.target.value})}
  variant="outlined"
  InputProps={{
    style: { 
      color: '#ffffff',
      '&::placeholder': {
        color: '#a0a0a0',
      }
    }
  }}
  InputLabelProps={{
    style: { color: '#ffffff' },
    shrink: true
  }}
  sx={{
    border: '1px solid #4db5ff',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: '#3a3a4d',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: 'none',
      },
      '&:hover': {
        borderColor: '#4db5ff',
        boxShadow: '0 0 0 2px rgba(77, 181, 255, 0.3)',
      },
      '&.Mui-focused': {
        boxShadow: '0 0 0 2px rgba(77, 181, 255, 0.5)',
      },
    },
    '& .MuiInputBase-input::placeholder': {
      color: '#a0a0a0',
      opacity: 1,
    },
  }}
  placeholder="Enter detailed report of your visit..."
/>
              <Button
                variant="outlined"
                fullWidth
                onClick={fetchLocation}
                disabled={isFetchingLocation}
                sx={{
                  height: '48px',
                  marginBottom: '20px',
                  color: '#4db5ff',
                  borderColor: '#4db5ff',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    borderColor: '#4db5ff',
                  },
                }}
              >
                {isFetchingLocation ? (
                  <CircularProgress size={24} sx={{ color: '#4db5ff' }} />
                ) : (
                  'Get Current Location'
                )}
              </Button>

              {/* Photo Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                multiple
                style={{
                  display: 'block',
                  marginBottom: '20px',
                  fontSize: '14px',
                  color: '#fff',
                  padding: '10px',
                  backgroundColor: '#3a3a4d',
                  borderRadius: '8px',
                  border: '1px solid #4db5ff',
                }}
              />

              {/* Display selected photos */}
              {formData.photos.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#a0a0a0', mb: 1 }}>
                    Selected photos: {formData.photos.length}/5
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  height: '48px',
                  fontSize: '16px',
                  background: 'linear-gradient(90deg, #4db5ff, #005bb5)',
                  color: '#fff',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0, 91, 181, 0.3)',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  'Submit Visit'
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

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

export default FieldVisitReport;