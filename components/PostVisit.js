import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  InputLabel,
  Select,
  FormControl,
  MenuItem as SelectMenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Navbar from './Navbar';

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

const PostVisit = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    place: "",
    location: "",
    instructions: "",
    assignedTo: "",
    deadline: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const navigate = useNavigate();

  // Get user data for navbar
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";
  const role = user?.role ? 
    user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 
    "User";
  const designation = user?.designation || "";

  // Navigation items configuration
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'User'] },
    { label: 'Post Visit', path: '/post-visit', roles: ['Admin'] },
    { label: 'Field Visit Log', path: '/log-visit', roles: ['Admin', 'User'] },
    { label: 'Approve Reports', path: '/approve-reports', roles: ['Admin'] }
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item =>
    item.roles.map(r => r.toLowerCase()).includes(role.toLowerCase())
  );

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      deadline: date
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePostVisit = async () => {
    // Validate all required fields
    if (!formData.place?.trim() || 
        !formData.location?.trim() || 
        !formData.assignedTo || 
        !formData.deadline) {
      setSnackbar({
        open: true,
        message: 'All fields are required',
        severity: 'error'
      });
      return;
    }

    // Convert deadline to ISO string
    const isoDeadline = formData.deadline.toISOString();
    console.log("Submitting:", {
      place: formData.place,
      location: formData.location,
      assignedTo: formData.assignedTo,
      deadline: formData.deadline?.toISOString(),
      instructions: formData.instructions
    });
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          place: formData.place.trim(),
          location: formData.location.trim(),
          assignedTo: formData.assignedTo,
          deadline: isoDeadline,
          instructions: formData.instructions.trim() || undefined 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post visit');
      }

      // Reset form on success
      setFormData({
        place: "",
        location: "",
        instructions: "",
        assignedTo: "",
        deadline: null
      });

      setSnackbar({
        open: true,
        message: 'Visit posted successfully!',
        severity: 'success'
      });

    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Server error while saving visit',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #004ff9, #000000)',
        padding: '10px',
      }}
    >
      {/* Use the imported Navbar component */}
      <Navbar onLogout={onLogout} navItems={filteredNavItems} />

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Card
          sx={{
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
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
              sx={{ fontWeight: 'bold', color: '#4db5ff' }}
            >
              Post a New Visit
            </Typography>
            
            <TextField
              name="place"
              label="Place"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.place}
              onChange={handleInputChange}
              InputLabelProps={{ style: { color: '#fff' } }}
              sx={{
                backgroundColor: '#3a3a4d',
                borderRadius: '8px',
                '& .MuiInputBase-input': { color: '#fff' },
                border: '1px solid #4db5ff',
                transition: 'border-color 0.3s ease',
                '&:hover': { borderColor: '#00bfff' },
              }}
            />
            
            <TextField
              name="location"
              label="Location"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.location}
              onChange={handleInputChange}
              InputLabelProps={{ style: { color: '#fff' } }}
              sx={{
                backgroundColor: '#3a3a4d',
                borderRadius: '8px',
                '& .MuiInputBase-input': { color: '#fff' },
                border: '1px solid #4db5ff',
                transition: 'border-color 0.3s ease',
                '&:hover': { borderColor: '#00bfff' },
              }}
            />

            {/* Employee Selection Dropdown */}
            <FormControl fullWidth margin="normal" sx={{
              '& .MuiInputLabel-root': { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#3a3a4d',
                borderRadius: '8px',
                color: '#fff',
                border: '1px solid #4db5ff',
                '&:hover': { borderColor: '#00bfff' },
              },
              '& .MuiSvgIcon-root': { color: '#fff' }
            }}>
              <InputLabel id="assigned-to-label">Assign To</InputLabel>
              <Select
                labelId="assigned-to-label"
                name="assignedTo"
                value={formData.assignedTo}
                label="Assign To"
                onChange={handleInputChange}
              >
                {employeeRoles.map((emp, index) => (
                  <SelectMenuItem key={index} value={emp.role}>
                    {emp.role}
                  </SelectMenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Deadline Date Picker */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Deadline"
                value={formData.deadline}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    sx={{
                      backgroundColor: '#3a3a4d',
                      borderRadius: '8px',
                      '& .MuiInputBase-input': { color: '#fff' },
                      '& .MuiInputLabel-root': { color: '#fff' },
                      border: '1px solid #4db5ff',
                      '&:hover': { borderColor: '#00bfff' },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
            
            <TextField
              name="instructions"
              label="Instructions"
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={4}
              value={formData.instructions}
              onChange={handleInputChange}
              InputLabelProps={{ style: { color: '#fff' } }}
              sx={{
                backgroundColor: '#3a3a4d',
                borderRadius: '8px',
                '& .MuiInputBase-input': { color: '#fff' },
                border: '1px solid #4db5ff',
                transition: 'border-color 0.3s ease',
                '&:hover': { borderColor: '#00bfff' },
              }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handlePostVisit}
              disabled={isSubmitting}
              sx={{
                marginTop: '20px',
                padding: '14px',
                fontSize: '18px',
                background: 'linear-gradient(90deg, #4db5ff, #005bb5)',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '10px',
                boxShadow: '0 6px 12px rgba(0, 91, 181, 0.3)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 16px rgba(0, 91, 181, 0.4)',
                }
              }}
            >
              {isSubmitting ? 'Posting...' : 'Post Visit'}
            </Button>
          </CardContent>
        </Card>
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

export default PostVisit;