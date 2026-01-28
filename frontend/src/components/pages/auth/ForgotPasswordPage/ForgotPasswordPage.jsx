import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../hooks/useAuth';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import FormField from '../../../molecules/FormField/FormField';
import AlertMessage from '../../../molecules/AlertMessage/AlertMessage';
import Link from '../../../atoms/Link/Link';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || t('auth.forgot.error', 'Error al enviar email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
        {t('auth.forgot.title', 'Recuperar Contraseña')}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
        {t('auth.forgot.subtitle', 'Te enviaremos un enlace para restablecer tu contraseña')}
      </Typography>

      <AlertMessage severity="success" show={success}>
        {t('auth.forgot.success', 'Se ha enviado un enlace de recuperación a tu correo')}
      </AlertMessage>

      <AlertMessage severity="error" show={!!error}>
        {error}
      </AlertMessage>

      {!success && (
        <Box component="form" onSubmit={handleSubmit}>
          <FormField
            label={t('auth.email', 'Correo Electrónico')}
            name="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            required
            placeholder="correo@ejemplo.com"
          />

          <Button type="submit" variant="contained" fullWidth size="large" loading={loading}>
            {t('auth.forgot.submit', 'Enviar Enlace')}
          </Button>
        </Box>
      )}

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Link to="/login">
          <Typography variant="body2" color="primary">
            {t('auth.forgot.backToLogin', 'Volver a iniciar sesión')}
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
