/**
 * ChurchDetailPage
 *
 * Enhanced public page displaying comprehensive church information.
 */

import {
  Container,
  Grid,
  Box,
  Chip as MuiChip,
  Paper,
  Divider,
  Link as MuiLink,
  IconButton,
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ChurchIcon from '@mui/icons-material/Church';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useGetChurchBySlugQuery } from '../../../../store/api/churchesApi';
import { useGetEventsQuery } from '../../../../store/api/eventsApi';
import { useGetSermonsQuery } from '../../../../store/api/sermonsApi';
import EventCard from '../../../organisms/EventCard/EventCard';
import SermonCard from '../../../organisms/SermonCard/SermonCard';
import Typography from '../../../atoms/Typography/Typography';
import Skeleton from '../../../atoms/Skeleton/Skeleton';
import Avatar from '../../../atoms/Avatar/Avatar';
import Button from '../../../atoms/Button/Button';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

interface ServiceSchedule {
  day: string;
  time: string;
  endTime: string;
  type: string;
  name: LocalizedString;
  description?: LocalizedString;
  isActive?: boolean;
}

interface Leader {
  id?: string;
  userId?: string;
  displayName: string;
  role: string;
  title?: LocalizedString;
  photoURL?: string | null;
  bio?: LocalizedString;
  isActive?: boolean;
  order?: number;
}

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
}

const DAYS_MAP: Record<string, string> = {
  sunday: 'Domingo',
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
};

const SERVICE_TYPE_MAP: Record<string, string> = {
  main_service: 'Servicio Principal',
  bible_study: 'Estudio Bíblico',
  prayer_meeting: 'Reunión de Oración',
  youth_meeting: 'Reunión de Jóvenes',
  women_meeting: 'Reunión de Mujeres',
  men_meeting: 'Reunión de Varones',
  children_service: 'Servicio de Niños',
  worship_night: 'Noche de Alabanza',
  special_service: 'Servicio Especial',
};

const LEVEL_MAP: Record<string, string> = {
  headquarters: 'Sede Internacional',
  country: 'Nacional',
  department: 'Departamental',
  province: 'Provincial',
  local: 'Local',
};

const ChurchDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { data: church, isLoading } = useGetChurchBySlugQuery(slug || '');
  const { data: events } = useGetEventsQuery(
    { churchId: church?.id, limit: 3, status: 'published' },
    { skip: !church?.id }
  );
  const { data: sermons } = useGetSermonsQuery(
    { churchId: church?.id, limit: 3 },
    { skip: !church?.id }
  );

  const getLocalizedText = (text: string | LocalizedString | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.es || '';
  };

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFoundationYear = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const now = new Date();
    const years = now.getFullYear() - year;
    return `${year} (${years} ${years === 1 ? 'año' : 'años'})`;
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={400} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="text" width="40%" height={48} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 3, borderRadius: 2 }} />
        </Container>
      </Box>
    );
  }

  if (!church) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <ChurchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          {t('churches.notFound', 'Iglesia no encontrada')}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          {t('churches.notFoundDescription', 'La iglesia que buscas no existe o ha sido eliminada.')}
        </Typography>
        <Button component={Link} to="/churches" variant="contained">
          {t('churches.viewAll', 'Ver todas las iglesias')}
        </Button>
      </Container>
    );
  }

  const name = getLocalizedText(church.name);
  const description = getLocalizedText(church.description);
  const history = getLocalizedText(church.history);
  const socialMedia = church.socialMedia as SocialMedia | undefined;
  const serviceSchedule = (church.serviceSchedule as ServiceSchedule[]) || [];
  const leadership = (church.leadership as Leader[]) || [];
  const activeLeaders = leadership
    .filter((l) => l.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Full address
  const addressParts = [
    church.address,
    church.city,
    church.department,
    church.country,
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ');

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 400 },
          bgcolor: 'grey.900',
          overflow: 'hidden',
        }}
      >
        {church.coverImage && (
          <Box
            component="img"
            src={church.coverImage}
            alt={name}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.7,
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />
        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            pb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
            {church.logoImage && (
              <Avatar
                src={church.logoImage}
                alt={name}
                sx={{
                  width: { xs: 80, md: 120 },
                  height: { xs: 80, md: 120 },
                  border: 3,
                  borderColor: 'common.white',
                  boxShadow: 3,
                }}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MuiChip
                  label={LEVEL_MAP[church.level] || church.level}
                  size="small"
                  sx={{ bgcolor: 'primary.main', color: 'white' }}
                />
                {church.isFeatured && (
                  <MuiChip
                    label={t('church.featured', 'Destacada')}
                    size="small"
                    sx={{ bgcolor: 'warning.main', color: 'white' }}
                  />
                )}
              </Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'common.white',
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                }}
              >
                {name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                {fullAddress && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ color: 'grey.300', fontSize: 18 }} />
                    <Typography sx={{ color: 'grey.300', fontSize: '0.875rem' }}>
                      {church.city}, {church.country}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PeopleIcon sx={{ color: 'grey.300', fontSize: 18 }} />
                  <Typography sx={{ color: 'grey.300', fontSize: '0.875rem' }}>
                    {church.stats?.memberCount || 0} {t('church.members', 'miembros')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* About Section */}
            {description && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ChurchIcon color="primary" />
                  {t('church.about', 'Acerca de Nosotros')}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {description}
                </Typography>
              </Paper>
            )}

            {/* History Section */}
            {history && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryEduIcon color="primary" />
                  {t('church.history', 'Nuestra Historia')}
                </Typography>
                {church.foundationDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2" color="textSecondary">
                      {t('church.foundedIn', 'Fundada en')}: {formatFoundationYear(church.foundationDate)}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    lineHeight: 1.8,
                    '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                    '& blockquote': {
                      borderLeft: 4,
                      borderColor: 'primary.main',
                      pl: 2,
                      ml: 0,
                      fontStyle: 'italic',
                      color: 'text.secondary',
                    },
                    '& ul, & ol': { pl: 3, mb: 1 },
                    '& li': { mb: 0.5 },
                    '& p': { mb: 1 },
                  }}
                  dangerouslySetInnerHTML={{ __html: history }}
                />
              </Paper>
            )}

            {/* Service Schedule */}
            {serviceSchedule.length > 0 && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="primary" />
                  {t('church.schedule', 'Horarios de Servicios')}
                </Typography>
                <Grid container spacing={2}>
                  {serviceSchedule
                    .filter((s) => s.isActive !== false)
                    .map((service, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'grey.50',
                            border: 1,
                            borderColor: 'grey.200',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {getLocalizedText(service.name) || SERVICE_TYPE_MAP[service.type] || service.type}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            <strong>{DAYS_MAP[service.day] || service.day}</strong> - {service.time} a {service.endTime}
                          </Typography>
                          {service.description && (
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                              {getLocalizedText(service.description)}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                </Grid>
              </Paper>
            )}

            {/* Leadership */}
            {activeLeaders.length > 0 && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon color="primary" />
                  {t('church.leadership', 'Liderazgo')}
                </Typography>
                <Grid container spacing={3}>
                  {activeLeaders.map((leader) => (
                    <Grid item xs={12} sm={6} md={4} key={leader.id || leader.displayName}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                          src={leader.photoURL || undefined}
                          alt={leader.displayName}
                          sx={{ width: 100, height: 100, mx: 'auto', mb: 1.5 }}
                        >
                          {leader.displayName?.[0]}
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {leader.displayName}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                          {getLocalizedText(leader.title) || leader.role}
                        </Typography>
                        {leader.bio && (
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getLocalizedText(leader.bio)}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Related Events */}
            {events?.data && events.data.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="primary" />
                    {t('church.upcomingEvents', 'Próximos Eventos')}
                  </Typography>
                  <MuiLink component={Link} to={`/events?churchId=${church.id}`} underline="hover">
                    {t('common.viewAll', 'Ver todos')}
                  </MuiLink>
                </Box>
                <Grid container spacing={3}>
                  {events.data.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                      <EventCard event={event} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Related Sermons */}
            {sermons?.data && sermons.data.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {t('church.recentSermons', 'Sermones Recientes')}
                  </Typography>
                  <MuiLink component={Link} to={`/sermons?churchId=${church.id}`} underline="hover">
                    {t('common.viewAll', 'Ver todos')}
                  </MuiLink>
                </Box>
                <Grid container spacing={3}>
                  {sermons.data.map((sermon) => (
                    <Grid item xs={12} sm={6} md={4} key={sermon.id}>
                      <SermonCard sermon={sermon} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Contact Card */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {t('church.contact', 'Contacto')}
              </Typography>

              {/* Address */}
              {fullAddress && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <LocationOnIcon sx={{ color: 'primary.main', mt: 0.25 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t('church.address', 'Dirección')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {fullAddress}
                    </Typography>
                    {church.coordinates && (
                      <MuiLink
                        href={`https://www.google.com/maps/search/?api=1&query=${church.coordinates.latitude},${church.coordinates.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {t('church.viewOnMap', 'Ver en Google Maps')}
                      </MuiLink>
                    )}
                  </Box>
                </Box>
              )}

              {/* Phone */}
              {church.phone && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <PhoneIcon sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t('church.phone', 'Teléfono')}
                    </Typography>
                    <MuiLink href={`tel:${church.phone}`} underline="hover">
                      <Typography variant="body2">{church.phone}</Typography>
                    </MuiLink>
                  </Box>
                </Box>
              )}

              {/* Email */}
              {church.email && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <EmailIcon sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t('church.email', 'Correo')}
                    </Typography>
                    <MuiLink href={`mailto:${church.email}`} underline="hover">
                      <Typography variant="body2">{church.email}</Typography>
                    </MuiLink>
                  </Box>
                </Box>
              )}

              {/* Website */}
              {church.website && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <LanguageIcon sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t('church.website', 'Sitio Web')}
                    </Typography>
                    <MuiLink href={church.website} target="_blank" rel="noopener noreferrer" underline="hover">
                      <Typography variant="body2">{church.website.replace(/^https?:\/\//, '')}</Typography>
                    </MuiLink>
                  </Box>
                </Box>
              )}

              {/* Social Media */}
              {socialMedia && Object.keys(socialMedia).some((k) => socialMedia[k as keyof SocialMedia]) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
                    {t('church.followUs', 'Síguenos')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {socialMedia.facebook && (
                      <IconButton
                        component="a"
                        href={socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ bgcolor: '#1877F2', color: 'white', '&:hover': { bgcolor: '#166FE5' } }}
                      >
                        <FacebookIcon fontSize="small" />
                      </IconButton>
                    )}
                    {socialMedia.instagram && (
                      <IconButton
                        component="a"
                        href={socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                          color: 'white',
                          '&:hover': { opacity: 0.9 },
                        }}
                      >
                        <InstagramIcon fontSize="small" />
                      </IconButton>
                    )}
                    {socialMedia.youtube && (
                      <IconButton
                        component="a"
                        href={socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ bgcolor: '#FF0000', color: 'white', '&:hover': { bgcolor: '#CC0000' } }}
                      >
                        <YouTubeIcon fontSize="small" />
                      </IconButton>
                    )}
                    {socialMedia.twitter && (
                      <IconButton
                        component="a"
                        href={socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ bgcolor: '#1DA1F2', color: 'white', '&:hover': { bgcolor: '#1A91DA' } }}
                      >
                        <TwitterIcon fontSize="small" />
                      </IconButton>
                    )}
                    {socialMedia.whatsapp && (
                      <IconButton
                        component="a"
                        href={`https://wa.me/${socialMedia.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ bgcolor: '#25D366', color: 'white', '&:hover': { bgcolor: '#22C55E' } }}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </>
              )}
            </Paper>

            {/* Foundation Info */}
            {church.foundationDate && !history && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {t('church.foundation', 'Fundación')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t('church.foundedIn', 'Fundada en')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(church.foundationDate)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Stats Card */}
            {church.stats && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {t('church.stats', 'Estadísticas')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        {church.stats.memberCount || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t('church.membersLabel', 'Miembros')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'secondary.50', borderRadius: 1 }}>
                      <Typography variant="h4" color="secondary" sx={{ fontWeight: 700 }}>
                        {church.stats.eventCount || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t('church.eventsLabel', 'Eventos')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'info.50', borderRadius: 1 }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                        {church.stats.sermonCount || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t('church.sermonsLabel', 'Sermones')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'warning.50', borderRadius: 1 }}>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                        {church.stats.ministryCount || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t('church.ministriesLabel', 'Ministerios')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ChurchDetailPage;
