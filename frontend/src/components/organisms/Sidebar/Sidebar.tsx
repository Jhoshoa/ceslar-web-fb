import { ReactNode } from 'react';
import {
  Drawer,
  Box,
  List,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuItem from '../../molecules/MenuItem/MenuItem';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

interface SidebarItem {
  label: string;
  icon?: ReactNode;
  path?: string;
  onClick?: () => void;
  badge?: ReactNode;
  disabled?: boolean;
}

type SidebarVariant = 'permanent' | 'temporary' | 'persistent';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  items?: SidebarItem[];
  collapsed?: boolean;
  variant?: SidebarVariant;
}

const Sidebar = ({
  open,
  onClose,
  items = [],
  collapsed = false,
  variant: variantProp,
}: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const variant = variantProp || (isMobile ? 'temporary' : 'permanent');
  const width = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Drawer
      variant={variant}
      open={variant === 'temporary' ? open : true}
      onClose={onClose}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', py: 1 }}>
        <List disablePadding>
          {items.map((item) => (
            <MenuItem
              key={item.path || item.label}
              label={item.label}
              icon={item.icon}
              path={item.path}
              onClick={item.onClick}
              collapsed={collapsed}
              badge={item.badge}
              disabled={item.disabled}
            />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
