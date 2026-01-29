import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../organisms/Header/Header';
import Footer from '../../organisms/Footer/Footer';
import useAuth from '../../../hooks/useAuth';
import { selectTheme, toggleTheme } from '../../../store/slices/preferences.slice';

const MainLayout = () => {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        user={user}
        themeMode={themeMode}
        onThemeToggle={handleThemeToggle}
        onLogout={handleLogout}
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
};

export default MainLayout;
