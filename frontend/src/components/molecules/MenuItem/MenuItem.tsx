import { ReactNode } from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  path?: string;
  onClick?: () => void;
  collapsed?: boolean;
  badge?: ReactNode;
  disabled?: boolean;
}

const MenuItem = ({
  label,
  icon,
  path,
  onClick,
  collapsed = false,
  badge,
  disabled = false,
}: MenuItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = path && location.pathname.startsWith(path);

  const handleClick = () => {
    if (onClick) return onClick();
    if (path) navigate(path);
  };

  const button = (
    <ListItemButton
      onClick={handleClick}
      selected={isActive || false}
      disabled={disabled}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        mx: 1,
        '&.Mui-selected': {
          bgcolor: 'primary.lighter',
          color: 'primary.main',
          '& .MuiListItemIcon-root': { color: 'primary.main' },
        },
      }}
    >
      {icon && <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40 }}>{icon}</ListItemIcon>}
      {!collapsed && <ListItemText primary={label} />}
      {!collapsed && badge}
    </ListItemButton>
  );

  return collapsed ? (
    <Tooltip title={label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
};

export default MenuItem;
