import React from 'react';
import PropTypes from 'prop-types';
import { Avatar as MuiAvatar } from '@mui/material';

const Avatar = ({
  src,
  alt,
  children,
  size = 40,
  variant = 'circular',
  sx,
  ...props
}) => (
  <MuiAvatar
    src={src}
    alt={alt}
    variant={variant}
    sx={{ width: size, height: size, ...sx }}
    {...props}
  >
    {children}
  </MuiAvatar>
);

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.number,
  variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
  sx: PropTypes.object,
};

export default Avatar;
