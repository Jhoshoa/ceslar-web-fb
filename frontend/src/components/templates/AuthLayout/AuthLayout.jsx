import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Typography from '../../atoms/Typography/Typography';

const AuthLayout = ({ title = 'Cristo Es La Respuesta' }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      py: 4,
    }}
  >
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {title}
        </Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Outlet />
      </Paper>
    </Container>
  </Box>
);

AuthLayout.propTypes = {
  title: PropTypes.string,
};

export default AuthLayout;
