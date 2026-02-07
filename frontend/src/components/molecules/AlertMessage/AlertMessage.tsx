import { ReactNode } from 'react';
import { Alert, AlertTitle, Collapse, SxProps, Theme } from '@mui/material';

type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
type AlertVariant = 'standard' | 'filled' | 'outlined';

interface AlertMessageProps {
  severity?: AlertSeverity;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  show?: boolean;
  variant?: AlertVariant;
  icon?: ReactNode;
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

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
}: AlertMessageProps) => (
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

export default AlertMessage;
