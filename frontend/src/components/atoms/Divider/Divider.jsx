import React from 'react';
import PropTypes from 'prop-types';
import { Divider as MuiDivider } from '@mui/material';

const Divider = ({
  orientation = 'horizontal',
  variant = 'fullWidth',
  light = false,
  children,
  sx,
  ...props
}) => (
  <MuiDivider
    orientation={orientation}
    variant={variant}
    light={light}
    sx={sx}
    {...props}
  >
    {children}
  </MuiDivider>
);

Divider.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['fullWidth', 'inset', 'middle']),
  light: PropTypes.bool,
  children: PropTypes.node,
  sx: PropTypes.object,
};

export default Divider;
