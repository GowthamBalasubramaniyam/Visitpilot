import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');

  const handleLogin = () => {
    // Call API to send OTP or authenticate
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Mobile Number"
        fullWidth
        margin="normal"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      <TextField
        label="OTP"
        fullWidth
        margin="normal"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
        Login
      </Button>
    </Container>
  );
};

export default Login;