import { useState, ChangeEvent, FormEvent } from 'react';
import { Box, Divider, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../../../hooks/useAuth';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import FormField from '../../../molecules/FormField/FormField';
import AlertMessage from '../../../molecules/AlertMessage/AlertMessage';
import Link from '../../../atoms/Link/Link';

interface RegisterForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerWithEmail, loginWithGoogle } = useAuth();

  const [form, setForm] = useState<RegisterForm>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = (): boolean => {
    if (form.password.length < 6) {
      setError(t('auth.register.passwordLength', 'La contraseña debe tener al menos 6 caracteres'));
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('auth.register.passwordMismatch', 'Las contraseñas no coinciden'));
      return false;
    }
    if (!acceptTerms) {
      setError(t('auth.register.acceptTerms', 'Debes aceptar los términos y condiciones'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      await registerWithEmail(form.email, form.password, form.displayName);
      navigate('/verify-email');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.register.error', 'Error al crear cuenta');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.googleError', 'Error con Google');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
        {t('auth.register.title', 'Crear Cuenta')}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
        {t('auth.register.subtitle', 'Únete a nuestra comunidad')}
      </Typography>

      <AlertMessage severity="error" show={!!error}>
        {error}
      </AlertMessage>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={handleGoogle}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {t('auth.register.google', 'Registrarse con Google')}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="textSecondary">
          {t('auth.login.or', 'o')}
        </Typography>
      </Divider>

      <Box component="form" onSubmit={handleSubmit}>
        <FormField
          label={t('auth.displayName', 'Nombre Completo')}
          name="displayName"
          value={form.displayName}
          onChange={handleChange}
          required
        />
        <FormField
          label={t('auth.email', 'Correo Electrónico')}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormField
          label={t('auth.password', 'Contraseña')}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          description={t('auth.register.passwordHint', 'Mínimo 6 caracteres')}
        />
        <FormField
          label={t('auth.confirmPassword', 'Confirmar Contraseña')}
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <FormControlLabel
          control={
            <Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
          }
          label={
            <Typography variant="body2">
              {t('auth.register.terms', 'Acepto los términos y condiciones')}
            </Typography>
          }
          sx={{ mb: 2 }}
        />

        <Button type="submit" variant="contained" fullWidth size="large" loading={loading}>
          {t('auth.register.submit', 'Crear Cuenta')}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="textSecondary">
          {t('auth.register.hasAccount', '¿Ya tienes cuenta?')}{' '}
          <Link to="/login">
            <Typography component="span" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              {t('auth.register.login', 'Inicia sesión')}
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
