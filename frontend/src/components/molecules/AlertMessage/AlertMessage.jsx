import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Collapse } from '@mui/material';

const AlertMessage = ({
  severity = 'info',
  title,
  children,
  onClose,
  show = true,
  variant = 'standard',
  icon,
  action,
  sx,
}) => (
  <Collapse in={show}>
    <Alert
      severity={severity}
      variant={variant}
      onClose={onClose}
      icon={icon}
      action={action}
      sx={{ mb: 2, ...sx }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </Alert>
  </Collapse>
);

AlertMessage.propTypes = {
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
  show: PropTypes.bool,
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  icon: PropTypes.node,
  action: PropTypes.node,
  sx: PropTypes.object,
};

export default AlertMessage;
