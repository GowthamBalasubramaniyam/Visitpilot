import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Box
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onLogout, navItems }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";
  const role = user?.role ? 
    user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 
    "User";
  const designation = user?.designation || '';
  const initials = username
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/Editprofile'); // Redirect to profile edit page
  };

  const getAbbreviatedDesignation = (fullDesignation) => {
    if (!fullDesignation) return '';
    
    const abbreviationMap = {
      'Revenue Divisional Officer (RDO)': 'RDO',
      'Tahsildar': 'TAH',
      'Block Development Officer (BDO)': 'BDO',
      'Chief/District Educational Officer (CEO/DEO)': 'EDU',
      'Deputy Director of Health Services (DDHS)': 'DDHS',
      'District Social Welfare Officer (DSWO)': 'DSWO',
      'Executive Engineer (PWD/Highways/Rural Dev)': 'ENG',
      'District Supply Officer (DSO)': 'DSO',
      'District Collector': 'IAS',
    };

    return abbreviationMap[fullDesignation] || fullDesignation;
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: '#001f4d',
        marginBottom: '20px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: '20px' }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              color="inherit"
              component={Link}
              to={item.path}
              sx={{
                fontWeight: 'bold',
                fontSize: '16px',
                textTransform: 'uppercase',
                '&:hover': { color: '#4db5ff' },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            onClick={handleProfileMenuOpen}
            sx={{
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                color: '#4db5ff',
              },
            }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#4db5ff', fontSize: '16px' }}>
              {initials}
            </Avatar>
            {username}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 4,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.4))',
                mt: 1.5,
                width: 280,
                borderRadius: '10px',
                background: 'linear-gradient(145deg, #1e1e2f, #2a2a3a)',
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1.5,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 12,
                  height: 12,
                  bgcolor: '#2a2a3a',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
                '& .MuiMenuItem-root': {
                  padding: '10px 16px',
                  color: '#e0e0e0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(77, 181, 255, 0.15)',
                    color: '#4db5ff',
                    '& svg': { color: '#4db5ff' },
                  },
                  '& svg': {
                    color: '#a0a0a0',
                    marginRight: '12px',
                    fontSize: '20px',
                    transition: 'all 0.2s ease',
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <Avatar sx={{ bgcolor: '#4db5ff' }}>
                {initials}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {username}
                </Typography>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
                  {role} • {getAbbreviatedDesignation(designation)}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1, bgcolor: '#3a3a4d' }} />

            <MenuItem onClick={handleProfileClick}>
              <AccountCircle />
              <Typography variant="body1">My Profile</Typography>
            </MenuItem>

            <Divider sx={{ my: 1, bgcolor: '#3a3a4d' }} />

            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                onLogout();
              }}
            >
              <ExitToApp />
              <Typography variant="body1">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;