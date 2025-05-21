import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    Slide
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

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

const EditVisitDialog = ({ open, onClose, visit, onSave }) => {
    const [formData, setFormData] = useState({
        place: '',
        location: '',
        postedTo: '',
        deadline: null,
        instructions: '',
        status: 'pending'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (open && visit) {
            setFormData({
                place: visit.place || '',
                location: visit.location || '',
                postedTo: visit.postedTo || '',
                deadline: visit.deadline ? new Date(visit.deadline) : null,
                instructions: visit.instructions || '',
                status: 'pending'
            });
            setError(null);
            setSuccess(null);
        }
    }, [open, visit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            deadline: date
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!formData.place || !formData.location || !formData.postedTo || !formData.deadline) {
                throw new Error('Please fill all required fields');
            }

            if (new Date(formData.deadline) < new Date()) {
                throw new Error('Deadline cannot be in the past');
            }

            const submissionData = {
                ...formData,
                status: 'pending',
                deadline: format(formData.deadline, 'yyyy-MM-dd')
            };

            await onSave(submissionData);

            setSuccess('Visit updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error updating visit:', err);
            setError(err.message || 'Failed to update visit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    width: '90%',
                    maxWidth: '600px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(30,30,47,0.9)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #004ff9, #000000)',
                color: '#fff',
                padding: '16px 24px',
                fontWeight: '600',
                fontSize: '1.25rem'
            }}>
                Edit Field Visit
            </DialogTitle>
            <DialogContent sx={{
                background: 'linear-gradient(145deg, #20202f, #2c2c3c)',
                padding: '24px'
            }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
  <Grid item xs={12} sm={6} sx={{ mt: 2 }}>
    <TextField
      fullWidth
      label="Place"
      name="place"
      value={formData.place}
      onChange={handleChange}
      required
      size="small"
      sx={textFieldStyle}
    />
  </Grid>
  <Grid item xs={12} sm={6} sx={{ mt: 2 }}>
    <TextField
      fullWidth
      label="Location"
      name="location"
      value={formData.location}
      onChange={handleChange}
      required
      size="small"
      sx={textFieldStyle}
    />
  </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Posted To"
                                name="postedTo"
                                value={formData.postedTo}
                                onChange={handleChange}
                                required
                                size="small"
                                sx={selectFieldStyle}
                            >
                                {employeeRoles.map((option) => (
                                    <MenuItem
                                        key={option.prefix}
                                        value={option.role}
                                        sx={menuItemStyle}
                                    >
                                        {option.role}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Deadline"
                                    value={formData.deadline}
                                    onChange={handleDateChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            required
                                            size="small"
                                            sx={datePickerStyle}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Instructions"
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                size="small"
                                sx={textFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Chip
                                label="Pending"
                                color="warning"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.8125rem',
                                    color: '#ffca28',
                                    borderColor: '#ffca28',
                                    px: 1
                                }}
                            />
                        </Grid>
                    </Grid>

                    {error && (
                        <Alert severity="error" sx={alertStyle}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={alertStyle}>
                            {success}
                        </Alert>
                    )}
                </form>
            </DialogContent>
            <DialogActions sx={dialogActionsStyle}>
                <Button onClick={onClose} size="small" sx={cancelButtonStyle}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading} size="small" sx={saveButtonStyle}>
                    {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const textFieldStyle = {
    '& .MuiInputLabel-root': {
        color: '#a0a0a0',
        fontSize: '0.875rem'
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#4b4b5e',
            transition: 'border-color 0.3s ease'
        },
        '&:hover fieldset': {
            borderColor: '#4db5ff',
            boxShadow: '0 0 0 2px rgba(77, 181, 255, 0.1)'
        },
        '&.Mui-focused fieldset': {
            borderColor: '#4db5ff',
            boxShadow: '0 0 0 2px rgba(77, 181, 255, 0.2)'
        }
    },
    '& .MuiInputBase-input': {
        color: '#fff',
        fontSize: '0.875rem',
        padding: '10px 14px'
    },
    transition: 'all 0.3s ease',
    marginBottom: '8px'
};

const selectFieldStyle = { ...textFieldStyle };

const datePickerStyle = { ...textFieldStyle };

const menuItemStyle = {
    fontSize: '0.875rem',
    padding: '6px 16px',
    minHeight: 'auto',
    color: '#fff'
};

const alertStyle = {
    mt: 2,
    fontSize: '0.875rem',
    '& .MuiAlert-message': {
        padding: '4px 0'
    }
};

const dialogActionsStyle = {
    background: 'linear-gradient(145deg, #1e1e2f, #2a2a3a)',
    padding: '12px 20px',
    borderTop: '1px solid #3a3a4d'
};

const cancelButtonStyle = {
    color: '#ff6b6b',
    fontWeight: '500',
    fontSize: '0.8125rem',
    padding: '6px 12px',
    '&:hover': {
        backgroundColor: 'rgba(255, 107, 107, 0.1)'
    },
    transition: 'background-color 0.3s ease-in-out'
};

const saveButtonStyle = {
    background: 'linear-gradient(90deg, #4db5ff, #005bb5)',
    color: '#fff',
    fontWeight: '500',
    fontSize: '0.8125rem',
    padding: '6px 16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        background: 'linear-gradient(90deg, #3da5e5, #004a9a)'
    },
    '&:disabled': {
        background: 'linear-gradient(90deg, #3a3a4d, #3a3a4d)',
        color: '#a0a0a0'
    }
};

export default EditVisitDialog;
