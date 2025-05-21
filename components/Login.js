import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('User');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeIdError, setEmployeeIdError] = useState('');
  const [selectedEmployeeRole, setSelectedEmployeeRole] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  const employeeRoles = [
    { role: 'Revenue Divisional Officer (RDO)', prefix: 'RDO' },
    { role: 'Tahsildar', prefix: 'TAH' },
    { role: 'Block Development Officer (BDO)', prefix: 'BDO' },
    { role: 'Chief/District Educational Officer (CEO/DEO)', prefix: 'EDU' },
    { role: 'Deputy Director of Health Services (DDHS)', prefix: 'DDHS' },
    { role: 'District Social Welfare Officer (DSWO)', prefix: 'DSWO' },
    { role: 'Executive Engineer (PWD/Highways/Rural Dev)', prefix: 'ENG' },
    { role: 'District Supply Officer (DSO)', prefix: 'DSO' }
  ];

  useEffect(() => {
    setReloadKey(prev => prev + 1);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const validateEmployeeId = async (rawId) => {
    try {
      if (!rawId || rawId.trim() === '') {
        setEmployeeIdError('Employee ID is required');
        return false;
      }

      console.log('Validating employee ID:', rawId);
      const response = await axios.get(
        `http://localhost:5000/api/employees/validate/${encodeURIComponent(rawId)}`
      );

      console.log('Validation response:', response.data);

      if (response.data.isValid) {
        setEmployeeIdError('');
        return true;
      } else {
        setEmployeeIdError(response.data.message || 'Invalid Employee ID');
        return false;
      }
    } catch (err) {
      console.error('Validation error:', err);

      const errorMsg = err.response?.data?.message ||
        (err.response?.status === 404 ? 'Employee ID not found in system' :
          'Error validating employee ID');

      setEmployeeIdError(errorMsg);
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      if (!username.trim() || !password.trim()) {
        setError('Please enter both username and password');
        setOpenErrorSnackbar(true);
        return;
      }

      // Validate employee ID if role is Admin
      if (role === 'Admin') {
        const isValid = await validateEmployeeId(employeeId);
        if (!isValid) {
          setOpenErrorSnackbar(true);
          return;
        }
      }

      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          username,
          password,
          role,
          employeeId: role === 'Admin' || role === 'User' ? employeeId : undefined,
          employeeRole: role === 'User' ? selectedEmployeeRole : undefined
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;

      if (response.status !== 200) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.token) {
        throw new Error('No token received');
      }

      // Build user object with fallback values
      const userData = {
        ...data.user,
        username: data.user?.username || username,
        role: data.user?.role || role,
        designation: data.user?.designation ||
          (role === 'Admin' ? 'District Collector' : selectedEmployeeRole),
        employeeId: data.user?.employeeId || employeeId
      };

      // Verify we have the minimum required fields
      if (!userData.username || !userData.role || !userData.designation) {
        console.warn('Incomplete user data:', userData);
        throw new Error('Server returned incomplete user information');
      }

      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      onLogin(userData);
      setOpenSnackbar(true);
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed. Please try again.');
      setOpenErrorSnackbar(true);
    }
  };

  const handleCreateAccount = () => {
    navigate('/create-account');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #004ff9, #000000)',
        paddingRight: '10%',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            key={`login-form-${reloadKey}`}
            sx={{
              padding: '50px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              backgroundColor: '#1e1e2f',
              color: '#fff',
              width: '500px',
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  color: '#4db5ff',
                  marginBottom: '30px'
                }}
              >
                Welcome Back
              </Typography>

              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                InputLabelProps={{ style: { color: '#aaa' } }}
                sx={{
                  backgroundColor: '#2a2a3a',
                  borderRadius: '8px',
                  input: {
                    color: '#fff',
                    padding: '14px',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#3a3a4a',
                    },
                    '&:hover fieldset': {
                      borderColor: '#4db5ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4db5ff',
                    },
                  },
                  marginBottom: '20px'
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                InputLabelProps={{ style: { color: '#aaa' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: '#aaa' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  backgroundColor: '#2a2a3a',
                  borderRadius: '8px',
                  input: {
                    color: '#fff',
                    padding: '14px',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#3a3a4a',
                    },
                    '&:hover fieldset': {
                      borderColor: '#4db5ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4db5ff',
                    },
                  },
                  marginBottom: '20px'
                }}
              />

              <FormControl fullWidth margin="normal" sx={{ backgroundColor: '#2a2a3a', borderRadius: '8px', mb: 2 }}>
                <InputLabel id="role-label" sx={{ color: '#aaa' }} shrink>
                  Role
                </InputLabel>
                <Select
                  labelId="role-label"
                  id="role-select"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setSelectedEmployeeRole('');
                    setEmployeeId('');
                    setEmployeeIdError('');
                  }}
                  label="Role"
                  sx={{ color: '#fff' }}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                </Select>
              </FormControl>

              {role === 'User' && (
                <FormControl fullWidth margin="normal" sx={{ backgroundColor: '#2a2a3a', borderRadius: '8px', mb: 2 }}>
                  <InputLabel id="employee-role-label" sx={{ color: '#aaa' }} shrink>
                    Select Your Position
                  </InputLabel>
                  <Select
                    labelId="employee-role-label"
                    id="employee-role-select"
                    value={selectedEmployeeRole}
                    onChange={(e) => setSelectedEmployeeRole(e.target.value)}
                    label="Select Your Position"
                    sx={{ color: '#fff' }}
                  >
                    {employeeRoles.map((emp, index) => (
                      <MenuItem key={index} value={emp.role}>
                        {emp.role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {(role === 'Admin' || (role === 'User' && selectedEmployeeRole)) && (
                <TextField
                  label={
                    role === 'Admin'
                      ? 'Employee ID (District Collector)'
                      : `Employee ID (${selectedEmployeeRole})`
                  }
                  fullWidth
                  margin="normal"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value.trim());
                    if (employeeIdError) setEmployeeIdError('');
                  }}
                  variant="outlined"
                  error={!!employeeIdError}
                  helperText={employeeIdError || "Enter your government-issued employee ID"}
                  InputLabelProps={{ style: { color: '#aaa' } }}
                  sx={{
                    backgroundColor: '#2a2a3a',
                    borderRadius: '8px',
                    input: { color: '#fff' },
                    '& .MuiFormHelperText-root': {
                      color: employeeIdError ? '#f44336' : '#bbb',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#3a3a4a',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4db5ff',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4db5ff',
                      },
                    },
                    marginBottom: '10px'
                  }}
                />
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleLogin}
                sx={{
                  marginTop: '20px',
                  padding: '14px',
                  fontSize: '16px',
                  background: 'linear-gradient(90deg, #4db5ff, #005bb5)',
                  color: '#fff',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  boxShadow: '0 6px 12px rgba(0, 91, 181, 0.3)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0, 91, 181, 0.4)',
                    background: 'linear-gradient(90deg, #4db5ff, #0066cc)',
                  },
                }}
              >
                Login
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{
                  marginTop: '25px',
                  color: '#bbb',
                  fontSize: '15px'
                }}
              >
                Don't have an account?{' '}
                <span
                  onClick={handleCreateAccount}
                  style={{
                    color: '#4db5ff',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'color 0.2s ease-in-out',
                    '&:hover': {
                      color: '#3aa0e6',
                    }
                  }}
                >
                  Create Account
                </span>
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Login successful!
        </Alert>
      </Snackbar>

      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenErrorSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;