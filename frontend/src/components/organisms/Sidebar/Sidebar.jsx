import React from 'react';
import PropTypes from 'prop-types';
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

const Sidebar = ({
  open,
  onClose,
  items = [],
  collapsed = false,
  variant: variantProp,
}) => {
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

Sidebar.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      path: PropTypes.string,
      onClick: PropTypes.func,
      badge: PropTypes.node,
      disabled: PropTypes.bool,
    })
  ),
  collapsed: PropTypes.bool,
  variant: PropTypes.oneOf(['permanent', 'temporary', 'persistent']),
};

export default Sidebar;
