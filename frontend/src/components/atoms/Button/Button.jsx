import React from 'react';
import PropTypes from 'prop-types';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) => (
  <MuiButton
    variant={variant}
    color={color}
    size={size}
    disabled={disabled || loading}
    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
    endIcon={endIcon}
    fullWidth={fullWidth}
    onClick={onClick}
    type={type}
    {...props}
  >
    {children}
  </MuiButton>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info', 'inherit']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
