import React from 'react';
import PropTypes from 'prop-types';
import { Typography as MuiTypography } from '@mui/material';

const Typography = ({
  children,
  variant = 'body1',
  color = 'textPrimary',
  component,
  align,
  gutterBottom = false,
  noWrap = false,
  sx,
  ...props
}) => (
  <MuiTypography
    variant={variant}
    color={color}
    component={component}
    align={align}
    gutterBottom={gutterBottom}
    noWrap={noWrap}
    sx={sx}
    {...props}
  >
    {children}
  </MuiTypography>
);

Typography.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'subtitle1', 'subtitle2',
    'body1', 'body2',
    'caption', 'overline',
  ]),
  color: PropTypes.string,
  component: PropTypes.elementType,
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  gutterBottom: PropTypes.bool,
  noWrap: PropTypes.bool,
  sx: PropTypes.object,
};

export default Typography;
