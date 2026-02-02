import { Container, Paper, Box, FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Typography from '../../../atoms/Typography/Typography';
import LanguageSwitcher from '../../../molecules/LanguageSwitcher/LanguageSwitcher';
import Divider from '../../../atoms/Divider/Divider';

interface SettingsPageProps {
  themeMode?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

const SettingsPage = ({ themeMode, onThemeToggle }: SettingsPageProps) => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        {t('settings.title', 'Configuración')}
      </Typography>

      {/* Language */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('settings.language.title', 'Idioma')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {t('settings.language.description', 'Selecciona tu idioma preferido')}
        </Typography>
        <LanguageSwitcher size="medium" />
      </Paper>

      {/* Theme */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('settings.theme.title', 'Tema')}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={themeMode === 'dark'}
              onChange={onThemeToggle}
            />
          }
          label={t('settings.theme.dark', 'Modo oscuro')}
        />
      </Paper>

      {/* Notifications */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('settings.notifications.title', 'Notificaciones')}
        </Typography>
        <Box>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={t('settings.notifications.events', 'Eventos nuevos')}
          />
          <Divider sx={{ my: 1 }} />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={t('settings.notifications.sermons', 'Nuevos sermones')}
          />
          <Divider sx={{ my: 1 }} />
          <FormControlLabel
            control={<Switch />}
            label={t('settings.notifications.email', 'Notificaciones por email')}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
