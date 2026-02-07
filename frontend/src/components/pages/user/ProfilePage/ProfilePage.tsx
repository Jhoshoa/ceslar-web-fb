import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Container, Grid, Box, Paper, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../hooks/useAuth';
import { useGetMeQuery, useUpdateMeMutation } from '../../../../store/api/usersApi';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Avatar from '../../../atoms/Avatar/Avatar';
import FormField from '../../../molecules/FormField/FormField';
import AlertMessage from '../../../molecules/AlertMessage/AlertMessage';

interface ProfileForm {
  displayName: string;
  phone: string;
  bio: string;
}

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const { data: profile } = useGetMeQuery();
  const [updateMe, { isLoading: saving, isSuccess, isError }] = useUpdateMeMutation();

  const [form, setForm] = useState<ProfileForm>({
    displayName: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMe(form);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        {t('profile.title', 'Mi Perfil')}
      </Typography>

      <Grid container spacing={4}>
        {/* Avatar Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                src={authUser?.photoURL}
                alt={authUser?.displayName}
                sx={{ width: 120, height: 120, fontSize: 48 }}
              >
                {authUser?.displayName?.[0]?.toUpperCase()}
              </Avatar>
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {authUser?.displayName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {authUser?.email}
            </Typography>
          </Paper>
        </Grid>

        {/* Form Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <AlertMessage severity="success" show={isSuccess}>
              {t('profile.saved', 'Perfil actualizado correctamente')}
            </AlertMessage>
            <AlertMessage severity="error" show={isError}>
              {t('profile.error', 'Error al actualizar perfil')}
            </AlertMessage>

            <Box component="form" onSubmit={handleSubmit}>
              <FormField
                label={t('profile.displayName', 'Nombre')}
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                required
              />
              <FormField
                label={t('profile.email', 'Email')}
                name="email"
                value={authUser?.email || ''}
                disabled
                description={t('profile.emailHint', 'El email no se puede cambiar')}
              />
              <FormField
                label={t('profile.phone', 'Teléfono')}
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <FormField
                label={t('profile.bio', 'Biografía')}
                name="bio"
                value={form.bio}
                onChange={handleChange}
                multiline
                rows={3}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button type="submit" variant="contained" loading={saving}>
                  {t('common.save', 'Guardar')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
