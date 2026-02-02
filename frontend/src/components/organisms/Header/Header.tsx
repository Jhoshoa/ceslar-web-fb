import { useState, ReactNode } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Container,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import ChurchIcon from '@mui/icons-material/Church';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../molecules/LanguageSwitcher/LanguageSwitcher';
import ThemeToggle from '../../molecules/ThemeToggle/ThemeToggle';
import UserMenu from '../UserMenu/UserMenu';

// Import logo image
import ceslarLogo from '../../../assets/images/ceslar_logo.png';

import type { ChurchRole } from '@ceslar/shared-types';

interface LogoProps {
  onClick?: () => void;
}

// Logo component
const Logo = ({ onClick }: LogoProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      gap: 1.5,
    }}
  >
    <Box
      component="img"
      src={ceslarLogo}
      alt="CESLAR"
      sx={{
        width: 40,
        height: 40,
      }}
    />
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      <Box
        component="span"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
          fontSize: '1.25rem',
          color: 'primary.main',
          letterSpacing: '-0.5px',
        }}
      >
        CESLAR
      </Box>
    </Box>
  </Box>
);

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

type ThemeMode = 'light' | 'dark' | 'system';

interface UserData {
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
  systemRole?: string;
  churchRoles?: Record<string, ChurchRole>;
}

interface HeaderProps {
  user?: UserData | null;
  themeMode?: ThemeMode;
  onThemeToggle?: () => void;
  onLogout?: () => void;
}

const Header = ({
  user,
  themeMode,
  onThemeToggle,
  onLogout,
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: t('nav.home'), path: '/', icon: <HomeIcon /> },
    { label: t('nav.churches'), path: '/churches', icon: <ChurchIcon /> },
    { label: t('nav.events'), path: '/events', icon: <EventIcon /> },
    { label: t('nav.sermons'), path: '/sermons', icon: <MenuBookIcon /> },
    { label: t('nav.ministries'), path: '/ministries', icon: <GroupsIcon /> },
    { label: t('nav.about'), path: '/about', icon: <InfoIcon /> },
    { label: t('nav.contact'), path: '/contact', icon: <ContactMailIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo onClick={() => handleNavClick('/')} />
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavClick(item.path)}
            selected={isActive(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {!user ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<LoginIcon />}
              onClick={() => handleNavClick('/login')}
            >
              {t('nav.login')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              startIcon={<PersonAddIcon />}
              onClick={() => handleNavClick('/register')}
            >
              {t('nav.register')}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <UserMenu user={user} onLogout={onLogout} />
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1, color: 'primary.main' }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Logo onClick={() => navigate('/')} />

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 0.5,
                  mx: 4,
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive(item.path) ? 600 : 500,
                      bgcolor: isActive(item.path)
                        ? alpha(theme.palette.primary.main, 0.08)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        color: 'primary.main',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Spacer for mobile */}
            {isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && <LanguageSwitcher />}

              {onThemeToggle && (
                <ThemeToggle mode={themeMode} onToggle={onThemeToggle} size="small" />
              )}

              {/* Auth buttons - Desktop */}
              {!isMobile && !user && (
                <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 },
                    }}
                  >
                    {t('nav.login')}
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => navigate('/register')}
                  >
                    {t('nav.register')}
                  </Button>
                </Box>
              )}

              {/* User menu */}
              {user && <UserMenu user={user} onLogout={onLogout} />}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
