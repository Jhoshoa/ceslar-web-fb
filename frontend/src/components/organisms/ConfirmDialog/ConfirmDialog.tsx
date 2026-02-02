import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import Button from '../../atoms/Button/Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  loading?: boolean;
  destructive?: boolean;
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmColor = 'primary',
  loading = false,
  destructive = false,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    {message && (
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
    )}
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant="contained"
        color={destructive ? 'error' : confirmColor}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
