import React, { useState } from 'react';
import { Box } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../hooks/useAuth';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import AlertMessage from '../../../molecules/AlertMessage/AlertMessage';
import Link from '../../../atoms/Link/Link';

const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const { user, resendEmailVerification } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await resendEmailVerification();
      setSent(true);
    } catch (err) {
      setError(err.message || t('auth.verify.error', 'Error al reenviar email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <MarkEmailReadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {t('auth.verify.title', 'Verifica tu Email')}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        {t('auth.verify.message', 'Hemos enviado un enlace de verificación a')}
        {user?.email && (
          <Typography component="span" sx={{ fontWeight: 600, display: 'block', mt: 1 }}>
            {user.email}
          </Typography>
        )}
      </Typography>

      <AlertMessage severity="error" show={!!error}>
        {error}
      </AlertMessage>

      <AlertMessage severity="success" show={sent}>
        {t('auth.verify.resent', 'Email reenviado correctamente')}
      </AlertMessage>

      <Button
        variant="outlined"
        onClick={handleResend}
        loading={loading}
        disabled={sent}
        sx={{ mb: 2 }}
      >
        {t('auth.verify.resend', 'Reenviar Email')}
      </Button>

      <Box sx={{ mt: 2 }}>
        <Link to="/login">
          <Typography variant="body2" color="primary">
            {t('auth.verify.backToLogin', 'Volver a iniciar sesión')}
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;
