import { useState, ReactNode } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../organisms/Header/Header';
import Sidebar from '../../organisms/Sidebar/Sidebar';
import useAuth from '../../../hooks/useAuth';
import { selectTheme, toggleTheme } from '../../../store/slices/preferences.slice';
import type { AppDispatch } from '../../../store';

const DRAWER_WIDTH = 260;

interface MenuItem {
  label: string;
  icon?: ReactNode;
  path?: string;
  onClick?: () => void;
  badge?: ReactNode;
  disabled?: boolean;
}

interface DashboardLayoutProps {
  menuItems?: MenuItem[];
  title?: string;
}

const DashboardLayout = ({
  menuItems = [],
  title: _title,
}: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const themeMode = useSelector(selectTheme);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        user={user}
        themeMode={themeMode}
        onThemeToggle={handleThemeToggle}
        onLogout={handleLogout}
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

export default DashboardLayout;
