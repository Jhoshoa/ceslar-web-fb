import { useState, ChangeEvent, FormEvent } from 'react';
import { Box, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../../../hooks/useAuth';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import FormField from '../../../molecules/FormField/FormField';
import AlertMessage from '../../../molecules/AlertMessage/AlertMessage';
import Link from '../../../atoms/Link/Link';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle } = useAuth();

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(form.email, form.password);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.loginError', 'Error al iniciar sesión');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
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
        {t('auth.login.title', 'Iniciar Sesión')}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
        {t('auth.login.subtitle', 'Bienvenido de vuelta')}
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
        {t('auth.login.google', 'Continuar con Google')}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="textSecondary">
          {t('auth.login.or', 'o')}
        </Typography>
      </Divider>

      <Box component="form" onSubmit={handleSubmit}>
        <FormField
          label={t('auth.email', 'Correo Electrónico')}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="correo@ejemplo.com"
        />
        <FormField
          label={t('auth.password', 'Contraseña')}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Link to="/forgot-password">
            <Typography variant="body2" color="primary">
              {t('auth.forgotPassword', '¿Olvidaste tu contraseña?')}
            </Typography>
          </Link>
        </Box>

        <Button type="submit" variant="contained" fullWidth size="large" loading={loading}>
          {t('auth.login.submit', 'Ingresar')}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="textSecondary">
          {t('auth.login.noAccount', '¿No tienes cuenta?')}{' '}
          <Link to="/register">
            <Typography component="span" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              {t('auth.login.register', 'Regístrate')}
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
