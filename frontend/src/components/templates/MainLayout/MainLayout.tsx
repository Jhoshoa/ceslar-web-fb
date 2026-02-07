import { ReactNode, Suspense } from 'react';
import { Box, Toolbar, CircularProgress } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../organisms/Header/Header';
import Footer from '../../organisms/Footer/Footer';
import useAuth from '../../../hooks/useAuth';
import { selectTheme, toggleTheme } from '../../../store/slices/preferences.slice';
import type { AppDispatch } from '../../../store';

// Content-level loading component - fits within layout
const ContentLoader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress />
  </Box>
);

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
        <Suspense fallback={<ContentLoader />}>
          {children || <Outlet />}
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
