import { Container, Grid, Paper, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Typography from '../../../atoms/Typography/Typography';
import FormField from '../../../molecules/FormField/FormField';
import Button from '../../../atoms/Button/Button';

const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        {t('admin.settings.pageTitle', 'Configuración del Sistema')}
      </Typography>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('admin.settings.general', 'General')}
            </Typography>
            <FormField
              label={t('admin.settings.siteName', 'Nombre del Sitio')}
              name="siteName"
              value="Cristo Es La Respuesta"
              disabled
            />
            <FormField
              label={t('admin.settings.contactEmail', 'Email de Contacto')}
              name="contactEmail"
              value="info@ceslar.org"
              disabled
            />
          </Paper>
        </Grid>

        {/* Registration Settings */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('admin.settings.registration', 'Registro')}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {t('admin.settings.registrationDesc', 'Configura los requisitos para nuevos usuarios')}
            </Typography>
            <FormField
              label={t('admin.settings.defaultRole', 'Rol por defecto')}
              name="defaultRole"
              value="user"
              disabled
            />
          </Paper>
        </Grid>

        {/* Maintenance */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('admin.settings.maintenance', 'Mantenimiento')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" disabled>
                {t('admin.settings.clearCache', 'Limpiar Caché')}
              </Button>
              <Button variant="outlined" color="warning" disabled>
                {t('admin.settings.reseed', 'Reseed Database')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
