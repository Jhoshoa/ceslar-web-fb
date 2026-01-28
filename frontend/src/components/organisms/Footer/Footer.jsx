import React from 'react';
import { Box, Container, Grid, IconButton, Typography, alpha, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

// Import logo image
import ceslarLogo from '../../../assets/images/ceslar_logo.png';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: t('nav.home', 'Inicio'), path: '/' },
    { label: t('nav.about', 'Nosotros'), path: '/about' },
    { label: t('nav.churches', 'Iglesias'), path: '/churches' },
    { label: t('nav.events', 'Eventos'), path: '/events' },
    { label: t('nav.sermons', 'Sermones'), path: '/sermons' },
    { label: t('nav.contact', 'Contacto'), path: '/contact' },
  ];

  const resourceLinks = [
    { label: t('nav.doctrine', 'Doctrina'), path: '/doctrine' },
    { label: t('nav.ministries', 'Ministerios'), path: '/ministries' },
    { label: t('footer.privacy', 'Privacidad'), path: '/privacy' },
    { label: t('footer.terms', 'Términos'), path: '/terms' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0D1B4C',
        color: 'white',
        pt: { xs: 6, md: 8 },
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand & Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                component="img"
                src={ceslarLogo}
                alt="CESLAR"
                sx={{ width: 45, height: 45 }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                CESLAR
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: alpha('#FFFFFF', 0.7), mb: 3, lineHeight: 1.8 }}
            >
              {t(
                'footer.description',
                'Cristo Es La Respuesta - Una red de iglesias unidas por la fe, comprometidas con llevar el evangelio y el amor de Cristo a toda Sudamérica.'
              )}
            </Typography>
            {/* Social Icons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                sx={{
                  color: alpha('#FFFFFF', 0.7),
                  border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                  '&:hover': {
                    bgcolor: '#1877F2',
                    color: 'white',
                    borderColor: '#1877F2',
                  },
                }}
                aria-label="Facebook"
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: alpha('#FFFFFF', 0.7),
                  border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                  '&:hover': {
                    bgcolor: '#FF0000',
                    color: 'white',
                    borderColor: '#FF0000',
                  },
                }}
                aria-label="YouTube"
              >
                <YouTubeIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: alpha('#FFFFFF', 0.7),
                  border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                  '&:hover': {
                    background:
                      'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                    color: 'white',
                    borderColor: 'transparent',
                  },
                }}
                aria-label="Instagram"
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#D4AF37',
                mb: 2,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {t('footer.quickLinks', 'Enlaces')}
            </Typography>
            {quickLinks.map((link) => (
              <Box key={link.path} sx={{ mb: 1 }}>
                <Box
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: alpha('#FFFFFF', 0.7),
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: '#D4AF37',
                    },
                  }}
                >
                  {link.label}
                </Box>
              </Box>
            ))}
          </Grid>

          {/* Resources */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#D4AF37',
                mb: 2,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {t('footer.resources', 'Recursos')}
            </Typography>
            {resourceLinks.map((link) => (
              <Box key={link.path} sx={{ mb: 1 }}>
                <Box
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: alpha('#FFFFFF', 0.7),
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: '#D4AF37',
                    },
                  }}
                >
                  {link.label}
                </Box>
              </Box>
            ))}
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={4} md={4}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#D4AF37',
                mb: 2,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {t('footer.contact', 'Contacto')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOnIcon
                  sx={{ color: '#D4AF37', fontSize: 20, mt: 0.3 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: alpha('#FFFFFF', 0.7), lineHeight: 1.6 }}
                >
                  Av. 6 de Agosto #1234
                  <br />
                  La Paz, Bolivia
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhoneIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ color: alpha('#FFFFFF', 0.7) }}
                >
                  +591 2 1234567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ color: alpha('#FFFFFF', 0.7) }}
                >
                  contacto@ceslar.org
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider
          sx={{
            my: 4,
            borderColor: alpha('#FFFFFF', 0.1),
          }}
        />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: alpha('#FFFFFF', 0.5), textAlign: { xs: 'center', sm: 'left' } }}
          >
            &copy; {year} Cristo Es La Respuesta.{' '}
            {t('footer.rights', 'Todos los derechos reservados.')}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: alpha('#FFFFFF', 0.5), textAlign: { xs: 'center', sm: 'right' } }}
          >
            {t('footer.madeWith', 'Hecho con')} ❤️ {t('footer.forChurch', 'para la iglesia')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
