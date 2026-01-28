import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from '../../atoms/Button/Button';

const FormDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  loading = false,
  maxWidth = 'sm',
  fullWidth = true,
  disableSubmit = false,
}) => (
  <Dialog
    open={open}
    onClose={loading ? undefined : onClose}
    maxWidth={maxWidth}
    fullWidth={fullWidth}
  >
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 6 }}>
      {title}
      <IconButton
        onClick={onClose}
        disabled={loading}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent dividers>
      <Box sx={{ pt: 1 }}>{children}</Box>
    </DialogContent>

    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant="contained"
        onClick={onSubmit}
        loading={loading}
        disabled={disableSubmit}
      >
        {submitLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

FormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  loading: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  disableSubmit: PropTypes.bool,
};

export default FormDialog;
