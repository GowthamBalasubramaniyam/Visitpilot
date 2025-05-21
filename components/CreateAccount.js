import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ContentCopy from '@mui/icons-material/ContentCopy';

const CreateAccount = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [employeeIdError, setEmployeeIdError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedEmployeeRole, setSelectedEmployeeRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const validateForm = () => {
    if (!username || !email || !password) {
      setError('Please fill all required fields');
      setOpenErrorSnackbar(true);
      return false;
    }

    if ((role === 'Admin' || role === 'User') && !employeeId) {
      setError('Employee ID is required for registration');
      setOpenErrorSnackbar(true);
      return false;
    }

    if (role === 'User' && !selectedEmployeeRole) {
      setError('Please select your position');
      setOpenErrorSnackbar(true);
      return false;
    }

    return true;
  };

  const validateEmployeeId = async (rawId) => {
    try {
      const employeeId = rawId.trim();

      if (!employeeId) {
        setEmployeeIdError('Employee ID is required');
        return false;
      }

      const checkRes = await axios.get(`/api/users/check-employee-id/${encodeURIComponent(employeeId)}`);

      if (checkRes.data.exists) {
        setEmployeeIdError('This employee ID is already registered');
        return false;
      }

      const validationRes = await axios.get(`/api/employees/validate/${encodeURIComponent(employeeId)}`);

      if (!validationRes.data.isValid) {
        setEmployeeIdError(validationRes.data.message || 'Invalid Employee ID');
        return false;
      }

      setEmployeeIdError('');
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      setEmployeeIdError('Error validating employee ID');
      return false;
    }
  };

  const generateStrongPassword = () => {
    if (!username) {
      setError('Please enter a username to generate a password.');
      setOpenErrorSnackbar(true);
      return;
    }
    const baseString = username.slice(0, Math.min(username.length, 4)).toLowerCase();
    const randomNumber = Math.random().toString(36).substring(2, 4);
    const symbols = '!@#$%^&*';
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    let generatedPassword = baseString + randomNumber + randomSymbol;
    while (generatedPassword.length < 8) {
      generatedPassword += Math.random().toString(36).substring(2, 3);
    }
    setPassword(generatedPassword.slice(0, 8)); // Ensure it's exactly 8 characters
  };

  const handleCopyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopySnackbarOpen(true);
      setTimeout(() => setCopySnackbarOpen(false), 2000);
    }
  };

  const handleSignup = async () => {
    try {
      if (!validateForm()) return;

      const registrationData = {
        username,
        email,
        password,
        role,
        employeeId,
        designation: role === 'Admin' ? 'District Collector' : selectedEmployeeRole,
        ...(role === 'User' && { employeeRole: selectedEmployeeRole })
      };

      console.log('Registration payload:', registrationData);

      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        registrationData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setOpenSnackbar(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(response.data.message || 'Registration failed');
        setOpenErrorSnackbar(true);
      }
    } catch (err) {
      console.error('Full registration error:', err);
      console.error('Error response data:', err.response?.data);

      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';

      setError(errorMessage);
      setOpenErrorSnackbar(true);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card
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
              <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#4db5ff' }}>
                Create Account
              </Typography>

              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                InputLabelProps={{ style: { color: '#fff' } }}
                sx={{ backgroundColor: '#3a3a4d', borderRadius: '8px', input: { color: '#fff' } }}
              />

              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                InputLabelProps={{ style: { color: '#fff' } }}
                sx={{ backgroundColor: '#3a3a4d', borderRadius: '8px', input: { color: '#fff' } }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                InputLabelProps={{ style: { color: '#fff' } }}
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position="end">
                        <Button
                          onClick={generateStrongPassword}
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{ marginRight: 1, color: '#4db5ff', borderColor: '#4db5ff', '&:hover': { borderColor: '#3aa0e6', color: '#3aa0e6' } }}
                        >
                          Generate
                        </Button>
                      </InputAdornment>
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{ color: '#fff' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                      {password && (
                        <InputAdornment position="end">
                          <IconButton onClick={handleCopyPassword} sx={{ color: '#fff' }}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )}
                    </>
                  ),
                }}
                sx={{ backgroundColor: '#3a3a4d', borderRadius: '8px', input: { color: '#fff' } }}
              />

              <FormControl fullWidth margin="normal" sx={{ backgroundColor: '#3a3a4d', borderRadius: '8px' }}>
                <InputLabel id="role-label" sx={{ color: '#fff' }} shrink>
                  Role
                </InputLabel>
                <Select
                  labelId="role-label"
                  id="role-select"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setSelectedEmployeeRole('');
                  }}
                  label="Role"
                  sx={{ color: '#fff' }}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                </Select>
              </FormControl>

              {role === 'User' && (
                <FormControl fullWidth margin="normal" sx={{ backgroundColor: '#3a3a4d', borderRadius: '8px' }}>
                  <InputLabel id="employee-role-label" sx={{ color: '#fff' }} shrink>
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
                <>
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
                    InputLabelProps={{ style: { color: '#fff' } }}
                    sx={{
                      backgroundColor: '#3a3a4d',
                      borderRadius: '8px',
                      input: { color: '#fff' },
                      '& .MuiFormHelperText-root': {
                        color: employeeIdError ? '#f44336' : '#bbb',
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#bbb', display: 'block', mt: -1, mb: 2 }}>
                    {role === 'Admin'
                      ? 'Only District Collector employees can register as Admin'
                      : `Only ${selectedEmployeeRole} employees can register as Users`}
                  </Typography>
                </>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleSignup}
                sx={{
                  marginTop: '20px',
                  padding: '14px',
                  fontSize: '18px',
                  background: 'linear-gradient(90deg, #4db5ff, #005bb5)',
                  color: '#fff',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  boxShadow: '0 6px 12px rgba(0, 91, 181, 0.3)',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Sign Up
              </Button>

              <Typography variant="body2" align="center" sx={{ marginTop: '15px', color: '#bbb' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#4db5ff',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Login
                </Link>
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
          Account created successfully!
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

      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={2000}
        onClose={() => setCopySnackbarOpen(false)}
        message="Password copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default CreateAccount;