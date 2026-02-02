import { useState, MouseEvent, ReactNode } from 'react';
import {
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  MenuItem as MuiMenuItem,
  Box,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Avatar from '../../atoms/Avatar/Avatar';
import type { ChurchRole } from '@ceslar/shared-types';

interface UserData {
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
  systemRole?: string;
  churchRoles?: Record<string, ChurchRole>;
}

interface UserMenuItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface UserMenuProps {
  user?: UserData | null;
  onLogout?: () => void;
}

const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  // Check if user has dashboard access (admin roles)
  const hasDashboardAccess = user?.systemRole === 'system_admin' ||
    user?.systemRole === 'admin' ||
    Object.values(user?.churchRoles || {}).some(role =>
      ['admin', 'pastor', 'leader'].includes(role)
    );

  const menuItems: UserMenuItem[] = [
    {
      label: t('menu.profile', 'Mi Perfil'),
      icon: <PersonIcon fontSize="small" />,
      onClick: () => navigate('/profile'),
    },
    {
      label: t('menu.settings', 'Configuración'),
      icon: <SettingsIcon fontSize="small" />,
      onClick: () => navigate('/settings'),
    },
  ];

  // Add dashboard link for users with dashboard access
  if (hasDashboardAccess) {
    menuItems.unshift({
      label: t('menu.dashboard', 'Dashboard'),
      icon: <DashboardIcon fontSize="small" />,
      onClick: () => navigate('/admin'),
    });
  }

  return (
    <>
      <IconButton onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
        <Avatar
          src={user?.photoURL || undefined}
          alt={user?.displayName || undefined}
          sx={{ width: 36, height: 36 }}
        >
          {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { minWidth: 220, mt: 1 } }}
      >
        {/* User info header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.displayName || t('menu.guest', 'Usuario')}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        {menuItems.map((item) => (
          <MuiMenuItem
            key={item.label}
            onClick={() => { handleClose(); item.onClick(); }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MuiMenuItem>
        ))}
        <Divider />
        <MuiMenuItem onClick={() => { handleClose(); onLogout?.(); }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>{t('menu.logout', 'Cerrar Sesión')}</ListItemText>
        </MuiMenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
