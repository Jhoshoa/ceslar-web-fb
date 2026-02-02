import { ReactNode, MouseEvent } from 'react';
import { Button as MuiButton, CircularProgress, ButtonProps as MuiButtonProps } from '@mui/material';

type ButtonVariant = 'contained' | 'outlined' | 'text';
type ButtonColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
type ButtonSize = 'small' | 'medium' | 'large';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color' | 'size'> {
  children: ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  type?: ButtonType;
}

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
}: ButtonProps) => (
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

export default Button;
