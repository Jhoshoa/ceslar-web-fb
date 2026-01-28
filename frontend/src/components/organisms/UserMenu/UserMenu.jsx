import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Avatar from '../../atoms/Avatar/Avatar';

const UserMenu = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  const menuItems = [
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

  if (user?.systemRole === 'system_admin') {
    menuItems.unshift({
      label: t('menu.admin', 'Panel Admin'),
      icon: <AdminPanelSettingsIcon fontSize="small" />,
      onClick: () => navigate('/admin'),
    });
  }

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
        <Avatar
          src={user?.photoURL}
          alt={user?.displayName}
          sx={{ width: 32, height: 32 }}
        >
          {user?.displayName?.[0]?.toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
      >
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
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t('menu.logout', 'Cerrar Sesión')}</ListItemText>
        </MuiMenuItem>
      </Menu>
    </>
  );
};

UserMenu.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
    systemRole: PropTypes.string,
  }),
  onLogout: PropTypes.func,
};

export default UserMenu;
