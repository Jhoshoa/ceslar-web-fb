/**
 * GlobalSnackbar Component
 *
 * Displays snackbar notifications from Redux state.
 */

import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { selectSnackbar, hideSnackbar } from '../../../store/slices/ui.slice';
import type { AppDispatch } from '../../../store';

const GlobalSnackbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { open, message, severity, autoHideDuration } = useSelector(selectSnackbar);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
