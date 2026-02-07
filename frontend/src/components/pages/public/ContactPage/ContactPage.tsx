import { useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import { Container, Grid, Box } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTranslation } from 'react-i18next';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import FormField from '../../../molecules/FormField/FormField';
import AlertMessage from '../../../molecules/AlertMessage/AlertMessage';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactInfo {
  icon: ReactNode;
  label: string;
  value: string;
}

const ContactPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo: ContactInfo[] = [
    { icon: <EmailIcon />, label: 'Email', value: 'info@ceslar.org' },
    { icon: <PhoneIcon />, label: t('contact.phone', 'Teléfono'), value: '+591 XXX XXX' },
    { icon: <LocationOnIcon />, label: t('contact.address', 'Dirección'), value: 'Cochabamba, Bolivia' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {t('contact.title', 'Contáctanos')}
      </Typography>
      <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
        {t('contact.subtitle', 'Estamos aquí para ayudarte')}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <AlertMessage severity="success" show={submitted}>
            {t('contact.success', '¡Mensaje enviado correctamente! Te responderemos pronto.')}
          </AlertMessage>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormField
                  label={t('contact.form.name', 'Nombre')}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormField
                  label={t('contact.form.email', 'Email')}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormField
                  label={t('contact.form.subject', 'Asunto')}
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormField
                  label={t('contact.form.message', 'Mensaje')}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  multiline
                  rows={5}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" size="large">
                  {t('contact.form.send', 'Enviar Mensaje')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ pl: { md: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              {t('contact.info.title', 'Información de Contacto')}
            </Typography>
            {contactInfo.map((info) => (
              <Box key={info.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Box sx={{ color: 'primary.main' }}>{info.icon}</Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {info.label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {info.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactPage;
