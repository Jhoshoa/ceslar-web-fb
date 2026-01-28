import React from 'react';
import PropTypes from 'prop-types';
import { Chip as MuiChip } from '@mui/material';

const Chip = ({
  label,
  color = 'default',
  variant = 'filled',
  size = 'medium',
  icon,
  avatar,
  onDelete,
  onClick,
  disabled = false,
  ...props
}) => (
  <MuiChip
    label={label}
    color={color}
    variant={variant}
    size={size}
    icon={icon}
    avatar={avatar}
    onDelete={onDelete}
    onClick={onClick}
    disabled={disabled}
    {...props}
  />
);

Chip.propTypes = {
  label: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'error', 'warning', 'info']),
  variant: PropTypes.oneOf(['filled', 'outlined']),
  size: PropTypes.oneOf(['small', 'medium']),
  icon: PropTypes.node,
  avatar: PropTypes.node,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Chip;
