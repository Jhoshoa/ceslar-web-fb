import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '../../organisms/Header/Header';
import Sidebar from '../../organisms/Sidebar/Sidebar';

const DRAWER_WIDTH = 260;

const DashboardLayout = ({
  user,
  themeMode,
  onThemeToggle,
  onLogout,
  menuItems = [],
  title,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        onMenuClick={() => setMobileOpen(!mobileOpen)}
        user={user}
        themeMode={themeMode}
        onThemeToggle={onThemeToggle}
        onLogout={onLogout}
        title={title}
      />

      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={menuItems}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

DashboardLayout.propTypes = {
  user: PropTypes.object,
  themeMode: PropTypes.string,
  onThemeToggle: PropTypes.func,
  onLogout: PropTypes.func,
  menuItems: PropTypes.array,
  title: PropTypes.string,
};

export default DashboardLayout;
