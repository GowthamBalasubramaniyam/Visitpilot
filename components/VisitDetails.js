import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  Divider,
  Chip,
  Modal,
  IconButton,
  Zoom,
  Snackbar,
  Alert
} from '@mui/material';
import { Close, NavigateBefore, NavigateNext, Download } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Pending, Cancel } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const VisitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchVisitDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/submitted-visits/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch visit details');
        }

        const data = await response.json();
        setVisit(data.visit);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitDetails();
  }, [id]);

  const handleOpenImage = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setOpenImage(true);
  };

  const handleCloseImage = () => {
    setOpenImage(false);
  };

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % visit.photos.length;
    setSelectedImage(visit.photos[nextIndex]);
    setCurrentImageIndex(nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex = (currentImageIndex - 1 + visit.photos.length) % visit.photos.length;
    setSelectedImage(visit.photos[prevIndex]);
    setCurrentImageIndex(prevIndex);
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/submitted-visits/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve visit');
      }

      setVisit(prev => ({ ...prev, status: 'Approved' }));
      
      setSnackbar({
        open: true,
        message: 'Report approved successfully',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/approve-reports');
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to approve visit',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusIcon = () => {
    switch (visit?.status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <Pending color="warning" />;
    }
  };

  const generatePdf = () => {
    if (!visit) return;

    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.height - 20;
    const margin = 10;

    const checkPageBreak = (requiredHeight) => {
      if (y + requiredHeight > pageHeight) {
        doc.addPage();
        y = 20;
      }
    };

    doc.setFontSize(20);
    doc.setTextColor(0, 0, 128);
    doc.text(`Visit Details - ${visit.place}`, margin, y);
    y += 15;

    const addText = (label, value) => {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(label, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 50, y);
      y += 10;
    };

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 128);
    doc.text('Visit Information:', margin, y);
    y += 10;

    addText('Officer Name:', visit.completedBy || 'N/A');
    addText('Designation:', visit.officerName || 'N/A');
    addText('Place:', visit.place || 'N/A');
    addText('Location:', visit.location || 'N/A');
    addText('Deadline:', visit.deadline ? new Date(visit.deadline).toLocaleDateString() : 'N/A');
    addText('Status:', visit.status || 'N/A');
    addText('Completed At:', visit.completedAt ? new Date(visit.completedAt).toLocaleString() : 'N/A');

    if (visit.report) {
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 128);
      doc.text('Report:', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const splitText = doc.splitTextToSize(visit.report, 180);
      
      for (let i = 0; i < splitText.length; i++) {
        checkPageBreak(7);
        doc.text(splitText[i], margin, y);
        y += 7;
      }
      y += 10;
    }

    if (visit.photos && visit.photos.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 128);
      doc.text('Photos:', margin, y);
      y += 10;

      for (let i = 0; i < visit.photos.length; i++) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = visit.photos[i];
          
          checkPageBreak(70);
          
          doc.addImage(img, 'JPEG', margin, y, 80, 60);
          y += 70;
          
          doc.setFontSize(10);
          doc.text(`Photo ${i + 1}`, margin, y);
          y += 10;
        } catch (e) {
          console.error("Error loading image", e);
          checkPageBreak(10);
          doc.text(`Error loading image ${i + 1}`, margin, y);
          y += 10;
        }
      }
    }

    doc.save(`VisitDetails-${visit.place}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #004ff9, #000000)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: '#4db5ff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #004ff9, #000000)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Alert severity="error" sx={{ maxWidth: '600px', width: '100%' }}>{error}</Alert>
      </Box>
    );
  }

  if (!visit) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #004ff9, #000000)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Alert severity="warning" sx={{ maxWidth: '600px', width: '100%' }}>Visit not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #004ff9, #000000)', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px'
    }}>
      <Box sx={{ 
        p: 3, 
        maxWidth: '1200px', 
        width: '100%',
        margin: '0 auto',
        flex: 1
      }}>
        {/* Removed the Back to Reports button */}

        <Paper elevation={3} sx={{ 
          p: 3, 
          mb: 3,
          background: '#001f4d',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
              Visit Details
            </Typography>
            <Chip
              label={visit.status}
              icon={getStatusIcon()}
              color={
                visit.status.toLowerCase() === 'approved' ? 'success' :
                visit.status.toLowerCase() === 'rejected' ? 'error' : 'warning'
              }
              sx={{ 
                fontSize: '1rem', 
                padding: '8px',
                color: 'white'
              }}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#4db5ff' }}>
                Officer Information
              </Typography>
              <Divider sx={{ mb: 2, bgcolor: '#3a3a4d' }} />
              
              <Box mb={3}>
                <Typography variant="subtitle1" color="#a0a0a0">Officer Name</Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {visit.completedBy || 'N/A'}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" color="#a0a0a0">Designation</Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {visit.officerName || 'N/A'}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" color="#a0a0a0">Completed At</Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {visit.completedAt ? new Date(visit.completedAt).toLocaleString() : 'N/A'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#4db5ff' }}>
                Visit Information
              </Typography>
              <Divider sx={{ mb: 2, bgcolor: '#3a3a4d' }} />
              
              <Box mb={3}>
                <Typography variant="subtitle1" color="#a0a0a0">Place</Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {visit.place || 'N/A'}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" color="#a0a0a0">Location</Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {visit.location || 'N/A'}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" color="#a0a0a0">Deadline</Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {visit.deadline ? new Date(visit.deadline).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Grid>

            {visit.report && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#4db5ff' }}>
                  Report
                </Typography>
                <Divider sx={{ mb: 2, bgcolor: '#3a3a4d' }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'white' }}>
                  {visit.report}
                </Typography>
              </Grid>
            )}

            {visit.photos && visit.photos.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#4db5ff' }}>
                  Photos
                </Typography>
                <Divider sx={{ mb: 2, bgcolor: '#3a3a4d' }} />
                <Grid container spacing={2}>
                  {visit.photos.map((photo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ 
                        background: 'transparent',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)'
                        }
                      }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={photo}
                          alt={`Visit photo ${index + 1}`}
                          sx={{ 
                            objectFit: 'cover',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleOpenImage(photo, index)}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>

          {visit.status.toLowerCase() !== 'approved' ? (
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleApprove}
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(45deg, #004ff9, #4db5ff)',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #003cc5, #3a9de6)'
                  }
                }}
              >
                Approve Visit
              </Button>
            </Box>
          ) : (
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={generatePdf}
                startIcon={<Download />}
                sx={{ 
                  ml: 2,
                  backgroundColor: '#4CAF50',
                  fontWeight: 'bold',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#388E3C',
                  },
                }}
              >
                Download Report
              </Button>
            </Box>
          )}
        </Paper>

        <Modal
          open={openImage}
          onClose={handleCloseImage}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Zoom in={openImage}>
            <Box sx={{
              position: 'relative',
              outline: 'none',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}>
              <IconButton
                onClick={handleCloseImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <Close />
              </IconButton>
              
              {visit.photos.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      zIndex: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)'
                      }
                    }}
                  >
                    <NavigateBefore />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      zIndex: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)'
                      }
                    }}
                  >
                    <NavigateNext />
                  </IconButton>
                </>
              )}
              
              <img
                src={selectedImage}
                alt={`Full screen view`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  display: 'block',
                  borderRadius: '4px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              />
              
              {visit.photos.length > 1 && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {currentImageIndex + 1} / {visit.photos.length}
                </Typography>
              )}
            </Box>
          </Zoom>
        </Modal>
      </Box>

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

export default VisitDetails;