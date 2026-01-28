import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import Button from '../../atoms/Button/Button';

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
}) => (
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

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmColor: PropTypes.string,
  loading: PropTypes.bool,
  destructive: PropTypes.bool,
};

export default ConfirmDialog;
