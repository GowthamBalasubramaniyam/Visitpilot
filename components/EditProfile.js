import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Person, Email, ArrowBack } from '@mui/icons-material';

const EditProfile = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const [username, setUsername] = useState(storedUser.username || '');
  const [email, setEmail] = useState(storedUser.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveMessage, setSaveMessage] = useState({ text: '', severity: 'success' });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSaveChanges = async () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Validate email
    if (email && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password if changed
    if (password || confirmPassword) {
      if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        isValid = false;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setErrors(newErrors);
    if (!isValid) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        username,
        email,
        ...(password && { password }) // Only include password if changed
      };

      const response = await axios.put(
        'http://localhost:5000/api/users/update-profile',
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local storage with new data
      const updatedUser = {
        ...storedUser,
        username: response.data.username,
        email: response.data.email
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSaveMessage({
        text: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage({
        text: error.response?.data?.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSaveMessage({ text: '', severity: 'success' }), 3000);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: { xs: 2, sm: 3 },
        background: 'linear-gradient(135deg, #004ff9, #000000)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        '@keyframes gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      <Paper 
        sx={{ 
          padding: { xs: 2, sm: 4 },
          maxWidth: 500, 
          width: '100%', 
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(30, 30, 47, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: '#4db5ff',
            fontWeight: 'bold',
            mb: 3,
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <Person fontSize="large" /> Edit Profile
        </Typography>

        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          variant="outlined"
          InputProps={{
            startAdornment: <Person sx={{ color: '#ffffff', mr: 1 }} />
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#3a3a4d',
              },
              '&:hover fieldset': {
                borderColor: '#4db5ff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4db5ff'
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a0a0a0',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#4db5ff',
            },
'& input': {
  color: '#ffffff', // text inside the input field
},
'& input::placeholder': {
  color: '#cccccc', // placeholder text
},

          }}
        />

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email}
          InputProps={{
            startAdornment: <Email sx={{ color: '#ffffff', mr: 1 }} />
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#3a3a4d',
              },
              '&:hover fieldset': {
                borderColor: '#4db5ff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4db5ff'
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a0a0a0',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#4db5ff',
            },
'& input': {
  color: '#ffffff', // text inside the input field
},
'& input::placeholder': {
  color: '#cccccc', // placeholder text
},

          }}
        />

        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          variant="outlined"
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            startAdornment: <Lock sx={{ color: '#ffffff', mr: 1 }} />
          }}
          placeholder="Leave blank to keep current password"
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#3a3a4d',
              },
              '&:hover fieldset': {
                borderColor: '#4db5ff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4db5ff'
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a0a0a0',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#4db5ff',
            },
'& input': {
  color: '#ffffff', // text inside the input field
},
'& input::placeholder': {
  color: '#cccccc', // placeholder text
},

          }}
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          variant="outlined"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          InputProps={{
            startAdornment: <Lock sx={{ color: '#ffffff', mr: 1 }} />
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#3a3a4d',
              },
              '&:hover fieldset': {
                borderColor: '#4db5ff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4db5ff'
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a0a0a0',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#4db5ff',
            },
'& input': {
  color: '#ffffff', // text inside the input field
},
'& input::placeholder': {
  color: '#cccccc', // placeholder text
},

          }}
        />

        <Fade in={!!saveMessage.text}>
          <Alert 
            severity={saveMessage.severity} 
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {saveMessage.text}
          </Alert>
        </Fade>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
            disabled={loading}
            startIcon={<ArrowBack />}
            sx={{
              color: '#4db5ff',
              borderColor: '#4db5ff',
              borderRadius: '8px',
              padding: '10px 20px',
              textTransform: 'none',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(77, 181, 255, 0.1)',
                borderColor: '#4db5ff',
                transform: 'translateY(-2px)'
              },
              flex: 1
            }}
          >
            Back
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveChanges}
            disabled={loading}
            sx={{
              background: 'linear-gradient(90deg, #4db5ff, #005bb5)',
              borderRadius: '8px',
              padding: '10px 20px',
              textTransform: 'none',
              fontWeight: 'bold',
              color: '#fff',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(90deg, #3da5e5, #004a9a)',
                boxShadow: '0 4px 12px rgba(77, 181, 255, 0.3)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: 'linear-gradient(90deg, #3a3a4d, #2a2a3a)',
                color: '#6a6a6a'
              },
              flex: 1
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'inherit' }} />
            ) : (
              'Save Changes'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditProfile;