import { ReactNode } from 'react';
import { Badge as MuiBadge } from '@mui/material';

type BadgeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
type BadgeVariant = 'standard' | 'dot';

interface BadgeProps {
  children: ReactNode;
  badgeContent?: ReactNode;
  color?: BadgeColor;
  variant?: BadgeVariant;
  invisible?: boolean;
  max?: number;
}

const Badge = ({
  children,
  badgeContent,
  color = 'primary',
  variant = 'standard',
  invisible = false,
  max = 99,
  ...props
}: BadgeProps) => (
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

export default Badge;
