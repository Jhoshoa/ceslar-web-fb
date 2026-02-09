/**
 * HistoryTimeline Organism
 *
 * A vertical timeline showing the key events in the church's history.
 * Features alternating left/right layout on desktop, stacked on mobile.
 */

import { Box, Container, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SectionTitle from '../../atoms/SectionTitle/SectionTitle';
import TimelineEvent from '../../molecules/TimelineEvent/TimelineEvent';

// Icons
import FlightLandIcon from '@mui/icons-material/FlightLand';
import ChurchIcon from '@mui/icons-material/Church';
import HealingIcon from '@mui/icons-material/Healing';
import PublicIcon from '@mui/icons-material/Public';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const HistoryTimeline = () => {
  const { t } = useTranslation();
  const navyColor = '#0D1B4C';

  const events = [
    {
      year: '1969',
      title: t('about.history.events.arrival.title', 'Llegada a Bolivia'),
      description: t(
        'about.history.events.arrival.description',
        'El 18 de septiembre de 1969 a las 6 PM, una pareja de misioneros recién graduados llegó a Santa Cruz de la Sierra, Bolivia, obedeciendo el llamado divino.'
      ),
      icon: <FlightLandIcon sx={{ fontSize: 12 }} />,
      highlight: true,
    },
    {
      year: '1969',
      title: t('about.history.events.firstService.title', 'Primer Culto'),
      description: t(
        'about.history.events.firstService.description',
        'El 24 de septiembre comenzaron a predicar en el barrio "El Lazareto" bajo un árbol de Tururé. El mensaje de Cristo empezó a resonar.'
      ),
      icon: <ChurchIcon sx={{ fontSize: 12 }} />,
    },
    {
      year: '1969',
      title: t('about.history.events.firstMiracle.title', 'Primer Milagro'),
      description: t(
        'about.history.events.firstMiracle.description',
        'Raquel de Orías fue sanada de espondilosis, convirtiéndose en la primera mensajera del poder de Dios en la naciente congregación.'
      ),
      icon: <HealingIcon sx={{ fontSize: 12 }} />,
    },
    {
      year: '1970s',
      title: t('about.history.events.expansion.title', 'Expansión Regional'),
      description: t(
        'about.history.events.expansion.description',
        'La obra misionera se extendió por todo el norte de Bolivia, llegando eventualmente a Perú, Brasil, Chile, Argentina y Paraguay.'
      ),
      icon: <PublicIcon sx={{ fontSize: 12 }} />,
    },
    {
      year: '1978',
      title: t('about.history.events.legal.title', 'Reconocimiento Legal'),
      description: t(
        'about.history.events.legal.description',
        'El 8 de septiembre de 1978, la iglesia obtuvo su reconocimiento oficial mediante Resolución Suprema No. 188425 del Ministerio de Relaciones Exteriores.'
      ),
      icon: <GavelIcon sx={{ fontSize: 12 }} />,
    },
    {
      year: t('about.history.events.present.year', 'Hoy'),
      title: t('about.history.events.present.title', 'Presente y Futuro'),
      description: t(
        'about.history.events.present.description',
        'Con sede internacional en Santa Cruz de la Sierra, la iglesia continúa su misión de restaurar la fe y transformar vidas en toda Sudamérica.'
      ),
      icon: <EmojiEventsIcon sx={{ fontSize: 12 }} />,
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: `radial-gradient(ellipse, ${alpha(navyColor, 0.02)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <SectionTitle
          label={t('about.history.label', 'NUESTRA TRAYECTORIA')}
          title={t('about.history.title', 'Historia de Fe')}
          subtitle={t(
            'about.history.subtitle',
            'Más de cinco décadas de servicio, milagros y transformación espiritual'
          )}
        />

        {/* Timeline */}
        <Box
          sx={{
            position: 'relative',
            mt: 8,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: { xs: '11px', md: '50%' },
              transform: { xs: 'none', md: 'translateX(-50%)' },
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: alpha(navyColor, 0.1),
              borderRadius: 2,
            },
          }}
        >
          {events.map((event, index) => (
            <TimelineEvent
              key={index}
              year={event.year}
              title={event.title}
              description={event.description}
              icon={event.icon}
              position={index % 2 === 0 ? 'left' : 'right'}
              highlight={event.highlight}
              delay={index * 0.15}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HistoryTimeline;
