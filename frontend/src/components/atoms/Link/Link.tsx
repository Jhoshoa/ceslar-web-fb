import { ReactNode } from 'react';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export interface LinkProps extends Omit<MuiLinkProps, 'component'> {
  children: ReactNode;
  to?: string;
  external?: boolean;
}

const Link = ({
  children,
  to,
  href,
  color = 'primary',
  underline = 'hover',
  external = false,
  ...props
}: LinkProps) => {
  if (external || href) {
    return (
      <MuiLink
        href={href || to}
        color={color}
        underline={underline}
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
      to={to || '/'}
      color={color}
      underline={underline}
      {...props}
    >
      {children}
    </MuiLink>
  );
};

export default Link;
