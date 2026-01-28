import React from 'react';
import PropTypes from 'prop-types';
import { Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Link = ({
  children,
  to,
  href,
  color = 'primary',
  underline = 'hover',
  variant = 'body1',
  external = false,
  ...props
}) => {
  if (external || href) {
    return (
      <MuiLink
        href={href || to}
        color={color}
        underline={underline}
        variant={variant}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </MuiLink>
    );
  }

  return (
    <MuiLink
      component={RouterLink}
      to={to}
      color={color}
      underline={underline}
      variant={variant}
      {...props}
    >
      {children}
    </MuiLink>
  );
};

Link.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string,
  href: PropTypes.string,
  color: PropTypes.string,
  underline: PropTypes.oneOf(['always', 'hover', 'none']),
  variant: PropTypes.string,
  external: PropTypes.bool,
};

export default Link;
