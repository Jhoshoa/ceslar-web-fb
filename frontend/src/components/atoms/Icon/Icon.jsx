import React from 'react';
import PropTypes from 'prop-types';
import { SvgIcon } from '@mui/material';

const Icon = ({
  children,
  component,
  color = 'inherit',
  fontSize = 'medium',
  sx,
  ...props
}) => (
  <SvgIcon
    component={component}
    color={color}
    fontSize={fontSize}
    sx={sx}
    {...props}
  >
    {children}
  </SvgIcon>
);

Icon.propTypes = {
  children: PropTypes.node,
  component: PropTypes.elementType,
  color: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'action', 'disabled', 'error']),
  fontSize: PropTypes.oneOf(['inherit', 'small', 'medium', 'large']),
  sx: PropTypes.object,
};

export default Icon;
