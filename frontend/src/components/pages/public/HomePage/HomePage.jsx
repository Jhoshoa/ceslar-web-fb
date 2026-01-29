import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Skeleton,
  alpha,
  Chip,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChurchIcon from '@mui/icons-material/Church';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';

import { useGetFeaturedChurchesQuery } from '../../../../store/api/churchesApi';
import { useGetUpcomingEventsQuery } from '../../../../store/api/eventsApi';
import { useGetSermonsQuery } from '../../../../store/api/sermonsApi';
import { useGetMinistriesQuery } from '../../../../store/api/ministriesApi';
import HeroSection from '../../../organisms/HeroSection/HeroSection';

// Section Title Component
const SectionTitle = ({ title, subtitle, light = false, centered = true, action }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: centered ? 'column' : 'row' },
      justifyContent: 'space-between',
      alignItems: centered ? 'center' : { xs: 'flex-start', md: 'flex-end' },
      mb: 5,
      textAlign: centered ? 'center' : 'left',
    }}
  >
    <Box>
      <Typography
        variant="h3"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
          color: light ? 'white' : 'primary.main',
          mb: 1,
          fontSize: { xs: '1.75rem', md: '2.25rem' },
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body1"
          sx={{
            color: light ? alpha('#FFFFFF', 0.8) : 'text.secondary',
            maxWidth: centered ? 600 : '100%',
            mx: centered ? 'auto' : 0,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && (
      <Button
        variant="outlined"
        color={light ? 'inherit' : 'primary'}
        endIcon={<ArrowForwardIcon />}
        onClick={action.onClick}
        sx={{
          mt: { xs: 2, md: 0 },
          borderWidth: 2,
          '&:hover': { borderWidth: 2 },
          ...(light && {
            color: 'white',
            borderColor: alpha('#FFFFFF', 0.5),
            '&:hover': {
              borderColor: 'white',
              bgcolor: alpha('#FFFFFF', 0.1),
            },
          }),
        }}
      >
        {action.label}
      </Button>
    )}
  </Box>
);

// Card Skeleton Component - matches ChurchCardItem
const ChurchCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={180} animation="wave" />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="80%" height={28} animation="wave" />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Skeleton variant="circular" width={16} height={16} sx={{ mr: 0.5 }} />
        <Skeleton variant="text" width="60%" height={20} animation="wave" />
      </Box>
    </CardContent>
  </Card>
);

// Sermon Card Skeleton - matches SermonCardItem
const SermonCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={200} animation="wave" />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="85%" height={28} animation="wave" />
      <Skeleton variant="text" width="60%" height={20} animation="wave" sx={{ mt: 1 }} />
    </CardContent>
  </Card>
);

// Ministry Card Skeleton - matches MinistryCardItem
const MinistryCardSkeleton = () => (
  <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
    <Skeleton variant="rectangular" width={70} height={70} sx={{ borderRadius: 2, mx: 'auto', mb: 2 }} />
    <Skeleton variant="text" width="70%" height={28} sx={{ mx: 'auto' }} animation="wave" />
    <Skeleton variant="text" width="90%" height={20} sx={{ mx: 'auto', mt: 1 }} animation="wave" />
    <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} animation="wave" />
  </Card>
);

// Feature Card for About Section
const FeatureCard = ({ icon: Icon, title, description }) => (
  <Box
    sx={{
      textAlign: 'center',
      p: 3,
    }}
  >
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        bgcolor: alpha('#D4AF37', 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: alpha('#D4AF37', 0.2),
          transform: 'scale(1.05)',
        },
      }}
    >
      <Icon sx={{ fontSize: 40, color: 'secondary.main' }} />
    </Box>
    <Typography
      variant="h6"
      sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}
    >
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

// Church Card Component
const ChurchCardItem = ({ church, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&:hover .church-image': {
        transform: 'scale(1.05)',
      },
    }}
  >
    <Box sx={{ position: 'relative', overflow: 'hidden', height: 180 }}>
      <CardMedia
        className="church-image"
        component="img"
        height="180"
        image={church.logo || church.coverImage || '/images/church-placeholder.jpg'}
        alt={church.name}
        sx={{ transition: 'transform 0.4s ease' }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
        }}
      >
        <Chip
          label={church.level}
          size="small"
          sx={{
            bgcolor: alpha('#D4AF37', 0.9),
            color: '#0D1B4C',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      </Box>
    </Box>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }} noWrap>
        {church.name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
        <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
        <Typography variant="body2" noWrap>
          {church.city}, {church.country}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Event Card Component
const EventCardItem = ({ event, onClick }) => {
  const eventDate = event.startDate ? new Date(event.startDate) : new Date();

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        height: '100%',
        minHeight: 140,
      }}
    >
      {/* Date Badge */}
      <Box
        sx={{
          width: 100,
          minWidth: 100,
          background: 'linear-gradient(135deg, #0D1B4C 0%, #1E3A8A 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          p: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif' }}
        >
          {eventDate.getDate()}
        </Typography>
        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          {eventDate.toLocaleDateString('es', { month: 'short' })}
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }} noWrap>
          {event.title?.es || event.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
          <Typography variant="body2">
            {event.startTime || '10:00 AM'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
          <Typography variant="body2" noWrap>
            {event.location || event.churchName}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Sermon Card Component
const SermonCardItem = ({ sermon, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&:hover .sermon-play': {
        transform: 'scale(1.1)',
        bgcolor: 'secondary.main',
      },
    }}
  >
    <Box sx={{ position: 'relative', height: 200 }}>
      <CardMedia
        component="img"
        height="200"
        image={sermon.thumbnail || '/images/sermon-placeholder.jpg'}
        alt={sermon.title?.es || sermon.title}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: alpha('#0D1B4C', 0.4),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          className="sermon-play"
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: alpha('#FFFFFF', 0.9),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <PlayCircleFilledIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
      </Box>
    </Box>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }} noWrap>
        {sermon.title?.es || sermon.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {sermon.preacher} • {sermon.duration || '45 min'}
      </Typography>
    </CardContent>
  </Card>
);

// Ministry Card Component
const MinistryCardItem = ({ ministry, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      textAlign: 'center',
      p: 3,
      height: '100%',
      '&:hover': {
        '& .ministry-icon': {
          bgcolor: 'secondary.main',
          color: 'primary.main',
        },
      },
    }}
  >
    <Box
      className="ministry-icon"
      sx={{
        width: 70,
        height: 70,
        borderRadius: 2,
        bgcolor: alpha('#0D1B4C', 0.08),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2,
        transition: 'all 0.3s ease',
      }}
    >
      <GroupsIcon sx={{ fontSize: 35, color: 'primary.main', transition: 'color 0.3s ease' }} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
      {ministry.name?.es || ministry.name}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {ministry.description?.es || ministry.description}
    </Typography>
  </Card>
);

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language?.split('-')[0] || 'es';

  // API calls
  const { data: churchesData, isLoading: loadingChurches } = useGetFeaturedChurchesQuery({ limit: 4 });
  const { data: eventsData, isLoading: loadingEvents } = useGetUpcomingEventsQuery({ limit: 3 });
  const { data: sermonsData, isLoading: loadingSermons } = useGetSermonsQuery({ limit: 3, sort: '-createdAt' });
  const { data: ministriesData, isLoading: loadingMinistries } = useGetMinistriesQuery({ limit: 4 });

  const churches = churchesData?.data || [];
  const events = eventsData?.data || [];
  const sermons = sermonsData?.data || [];
  const ministries = ministriesData?.data || [];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection
        title={t('home.hero.title', 'Cristo Es La Respuesta')}
        subtitle={t('home.hero.subtitle', 'Una red de iglesias unidas por la fe en toda Sudamérica')}
        description={t('home.hero.description', 'Somos una comunidad de fe dedicada a compartir el amor de Cristo y transformar vidas a través de la palabra de Dios.')}
        primaryAction={{
          label: t('home.hero.cta', 'Encuentra una Iglesia'),
          onClick: () => navigate('/churches'),
        }}
        secondaryAction={{
          label: t('home.hero.secondary', 'Ver Sermones'),
          onClick: () => navigate('/sermons'),
        }}
      />

      {/* About/Mission Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <SectionTitle
            title={t('home.about.title', 'Nuestra Misión')}
            subtitle={t('home.about.subtitle', 'Guiados por el amor de Dios, nos dedicamos a servir y transformar vidas')}
          />
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={FavoriteIcon}
                title={t('home.about.faith.title', 'Fe Viva')}
                description={t('home.about.faith.description', 'Cultivamos una fe activa que transforma vidas y comunidades')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={AutoStoriesIcon}
                title={t('home.about.word.title', 'La Palabra')}
                description={t('home.about.word.description', 'Enseñamos las escrituras como fundamento de vida')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={GroupsIcon}
                title={t('home.about.community.title', 'Comunidad')}
                description={t('home.about.community.description', 'Formamos una familia unida en Cristo')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={VolunteerActivismIcon}
                title={t('home.about.service.title', 'Servicio')}
                description={t('home.about.service.description', 'Servimos a nuestra comunidad con amor y dedicación')}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Churches Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <SectionTitle
            title={t('home.churches.title', 'Nuestras Iglesias')}
            subtitle={t('home.churches.subtitle', 'Encuentra una iglesia cerca de ti y únete a nuestra familia')}
            centered={false}
            action={{
              label: t('common.viewAll', 'Ver todas'),
              onClick: () => navigate('/churches'),
            }}
          />
          <Grid container spacing={3}>
            {loadingChurches
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <ChurchCardSkeleton />
                  </Grid>
                ))
              : churches.map((church) => (
                  <Grid item xs={12} sm={6} md={3} key={church.id}>
                    <ChurchCardItem
                      church={church}
                      onClick={() => navigate(`/churches/${church.slug}`)}
                    />
                  </Grid>
                ))}
          </Grid>
        </Container>
      </Box>

      {/* Events Section - Dark Background */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #0D1B4C 0%, #1E3A8A 100%)',
        }}
      >
        <Container maxWidth="lg">
          <SectionTitle
            title={t('home.events.title', 'Próximos Eventos')}
            subtitle={t('home.events.subtitle', 'No te pierdas nuestras actividades y reuniones especiales')}
            light
            centered={false}
            action={{
              label: t('common.viewAll', 'Ver todos'),
              onClick: () => navigate('/events'),
            }}
          />
          <Grid container spacing={3}>
            {loadingEvents
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Grid item xs={12} md={4} key={i}>
                    <Skeleton
                      variant="rectangular"
                      height={140}
                      animation="wave"
                      sx={{ borderRadius: 2, bgcolor: alpha('#FFFFFF', 0.1) }}
                    />
                  </Grid>
                ))
              : events.map((event) => (
                  <Grid item xs={12} md={4} key={event.id}>
                    <EventCardItem
                      event={event}
                      onClick={() => navigate(`/events/${event.id}`)}
                    />
                  </Grid>
                ))}
          </Grid>
        </Container>
      </Box>

      {/* Sermons Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <SectionTitle
            title={t('home.sermons.title', 'Últimos Sermones')}
            subtitle={t('home.sermons.subtitle', 'Escucha la palabra de Dios y alimenta tu espíritu')}
            centered={false}
            action={{
              label: t('common.viewAll', 'Ver todos'),
              onClick: () => navigate('/sermons'),
            }}
          />
          <Grid container spacing={3}>
            {loadingSermons
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <SermonCardSkeleton />
                  </Grid>
                ))
              : sermons.map((sermon) => (
                  <Grid item xs={12} sm={6} md={4} key={sermon.id}>
                    <SermonCardItem
                      sermon={sermon}
                      onClick={() => navigate(`/sermons/${sermon.id}`)}
                    />
                  </Grid>
                ))}
          </Grid>
        </Container>
      </Box>

      {/* Ministries Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <SectionTitle
            title={t('home.ministries.title', 'Nuestros Ministerios')}
            subtitle={t('home.ministries.subtitle', 'Descubre cómo puedes servir y crecer en nuestra comunidad')}
            centered={false}
            action={{
              label: t('common.viewAll', 'Ver todos'),
              onClick: () => navigate('/ministries'),
            }}
          />
          <Grid container spacing={3}>
            {loadingMinistries
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <MinistryCardSkeleton />
                  </Grid>
                ))
              : ministries.map((ministry) => (
                  <Grid item xs={12} sm={6} md={3} key={ministry.id}>
                    <MinistryCardItem
                      ministry={ministry}
                      onClick={() => navigate('/ministries')}
                    />
                  </Grid>
                ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: `linear-gradient(135deg, ${alpha('#D4AF37', 0.95)} 0%, ${alpha('#E5C76B', 0.95)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative cross */}
        <Box
          sx={{
            position: 'absolute',
            right: '10%',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.1,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 200,
              bgcolor: '#0D1B4C',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          <Box
            sx={{
              width: 120,
              height: 8,
              bgcolor: '#0D1B4C',
              position: 'absolute',
              top: 50,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </Box>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              color: '#0D1B4C',
              mb: 2,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
            }}
          >
            {t('home.cta.title', '¿Listo para dar el siguiente paso?')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: alpha('#0D1B4C', 0.8),
              mb: 4,
              fontWeight: 400,
            }}
          >
            {t('home.cta.subtitle', 'Únete a nuestra familia y descubre el propósito que Dios tiene para tu vida')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#0D1B4C',
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#1E3A8A',
                },
              }}
            >
              {t('home.cta.register', 'Regístrate Ahora')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/contact')}
              sx={{
                borderColor: '#0D1B4C',
                color: '#0D1B4C',
                borderWidth: 2,
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#0D1B4C',
                  bgcolor: alpha('#0D1B4C', 0.05),
                },
              }}
            >
              {t('home.cta.contact', 'Contáctanos')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Social Follow Section */}
      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
            {t('home.social.title', 'Síguenos en las redes')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <IconButton
              sx={{
                bgcolor: alpha('#0D1B4C', 0.08),
                '&:hover': { bgcolor: '#1877F2', color: 'white' },
              }}
              size="large"
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              sx={{
                bgcolor: alpha('#0D1B4C', 0.08),
                '&:hover': { bgcolor: '#FF0000', color: 'white' },
              }}
              size="large"
            >
              <YouTubeIcon />
            </IconButton>
            <IconButton
              sx={{
                bgcolor: alpha('#0D1B4C', 0.08),
                '&:hover': {
                  background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                  color: 'white',
                },
              }}
              size="large"
            >
              <InstagramIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
