import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ChurchIcon from '@mui/icons-material/Church';
import EventIcon from '@mui/icons-material/Event';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import QuizIcon from '@mui/icons-material/Quiz';
import SettingsIcon from '@mui/icons-material/Settings';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { useTranslation } from 'react-i18next';
import Header from '../../organisms/Header/Header';
import Sidebar from '../../organisms/Sidebar/Sidebar';
import useAuth from '../../../hooks/useAuth';
import { selectTheme, toggleTheme } from '../../../store/slices/preferences.slice';

const DRAWER_WIDTH = 260;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const dispatch = useDispatch();
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

  const menuItems = [
    { label: t('admin.dashboard', 'Dashboard'), icon: <DashboardIcon />, path: '/admin/dashboard' },
    { label: t('admin.users', 'Usuarios'), icon: <PeopleIcon />, path: '/admin/users' },
    { label: t('admin.churches', 'Iglesias'), icon: <ChurchIcon />, path: '/admin/churches' },
    { label: t('admin.events', 'Eventos'), icon: <EventIcon />, path: '/admin/events' },
    { label: t('admin.sermons', 'Sermones'), icon: <LibraryBooksIcon />, path: '/admin/sermons' },
    { label: t('admin.ministries', 'Ministerios'), icon: <GroupWorkIcon />, path: '/admin/ministries' },
    { label: t('admin.memberships', 'Membresías'), icon: <CardMembershipIcon />, path: '/admin/memberships' },
    { label: t('admin.questions', 'Preguntas'), icon: <QuizIcon />, path: '/admin/questions' },
    { label: t('admin.settings', 'Configuración'), icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        onMenuClick={() => setMobileOpen(!mobileOpen)}
        user={user}
        themeMode={themeMode}
        onThemeToggle={handleThemeToggle}
        onLogout={handleLogout}
        title="Admin"
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

export default AdminLayout;
