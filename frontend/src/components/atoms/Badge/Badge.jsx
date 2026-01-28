import React from 'react';
import PropTypes from 'prop-types';
import { Badge as MuiBadge } from '@mui/material';

const Badge = ({
  children,
  badgeContent,
  color = 'primary',
  variant = 'standard',
  invisible = false,
  max = 99,
  ...props
}) => (
  <MuiBadge
    badgeContent={badgeContent}
    color={color}
    variant={variant}
    invisible={invisible}
    max={max}
    {...props}
  >
    {children}
  </MuiBadge>
);

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  badgeContent: PropTypes.node,
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success', 'default']),
  variant: PropTypes.oneOf(['standard', 'dot']),
  invisible: PropTypes.bool,
  max: PropTypes.number,
};

export default Badge;
