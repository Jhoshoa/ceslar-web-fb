import { ReactNode } from 'react';
import { Divider as MuiDivider, SxProps, Theme } from '@mui/material';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'fullWidth' | 'inset' | 'middle';

interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  light?: boolean;
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

const Divider = ({
  orientation = 'horizontal',
  variant = 'fullWidth',
  light = false,
  children,
  sx,
  ...props
}: DividerProps) => (
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

export default Divider;
