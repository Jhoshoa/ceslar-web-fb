import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../organisms/Header/Header';
import Sidebar from '../../organisms/Sidebar/Sidebar';
import useAuth from '../../../hooks/useAuth';
import { selectTheme, toggleTheme } from '../../../store/slices/preferences.slice';

const DRAWER_WIDTH = 260;

const DashboardLayout = ({
  menuItems = [],
  title,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const themeMode = useSelector(selectTheme);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        onMenuClick={() => setMobileOpen(!mobileOpen)}
        user={user}
        themeMode={themeMode}
        onThemeToggle={handleThemeToggle}
        onLogout={handleLogout}
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
  menuItems: PropTypes.array,
  title: PropTypes.string,
};

export default DashboardLayout;
