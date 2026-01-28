import React from 'react';
import PropTypes from 'prop-types';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '../../organisms/Header/Header';
import Footer from '../../organisms/Footer/Footer';

const MainLayout = ({
  user,
  themeMode,
  onThemeToggle,
  onLogout,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Header
      user={user}
      themeMode={themeMode}
      onThemeToggle={onThemeToggle}
      onLogout={onLogout}
    />
    <Toolbar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        borderRadius: 0,
        overflow: 'hidden',
      }}
    >
      <Outlet />
    </Box>
    <Footer />
  </Box>
);

MainLayout.propTypes = {
  user: PropTypes.object,
  themeMode: PropTypes.string,
  onThemeToggle: PropTypes.func,
  onLogout: PropTypes.func,
};

export default MainLayout;
