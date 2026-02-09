/**
 * ImpactStats Organism
 *
 * Displays impressive statistics about the church's impact.
 * Features animated counters that trigger when scrolled into view.
 */

import { Box, Container, Grid, Typography, alpha, keyframes } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AnimatedCounter from '../../atoms/AnimatedCounter/AnimatedCounter';

// Icons
import ChurchIcon from '@mui/icons-material/Church';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
`;

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}

const StatItem = ({ icon, value, suffix = '', label, delay }: StatItemProps) => {
  const goldColor = '#D4AF37';

  return (
    <Box
      sx={{
        textAlign: 'center',
        position: 'relative',
        animation: `fadeInUp 0.8s ease-out ${delay}s both`,
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(30px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {/* Icon with glow */}
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
        }}
      >
        {/* Glow effect */}
        <Box
          sx={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(goldColor, 0.15),
            animation: `${pulse} 3s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            width: 70,
            height: 70,
            borderRadius: '50%',
            bgcolor: alpha(goldColor, 0.1),
            border: `2px solid ${alpha(goldColor, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& svg': {
              fontSize: 32,
              color: goldColor,
            },
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* Counter */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 0.5 }}>
        <AnimatedCounter
          end={value}
          duration={2500}
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            color: '#FFFFFF',
            lineHeight: 1,
          }}
        />
        {suffix && (
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: goldColor,
            }}
          >
            {suffix}
          </Typography>
        )}
      </Box>

      {/* Label */}
      <Typography
        variant="body1"
        sx={{
          color: alpha('#FFFFFF', 0.8),
          mt: 1,
          fontWeight: 500,
          letterSpacing: 1,
          textTransform: 'uppercase',
          fontSize: { xs: '0.75rem', md: '0.85rem' },
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

const ImpactStats = () => {
  const { t } = useTranslation();
  const goldColor = '#D4AF37';
  const navyColor = '#0D1B4C';

  const stats = [
    {
      icon: <CalendarMonthIcon />,
      value: 55,
      suffix: '+',
      label: t('about.stats.years', 'Años de Servicio'),
    },
    {
      icon: <ChurchIcon />,
      value: 200,
      suffix: '+',
      label: t('about.stats.churches', 'Iglesias'),
    },
    {
      icon: <PublicIcon />,
      value: 6,
      label: t('about.stats.countries', 'Países'),
    },
    {
      icon: <GroupsIcon />,
      value: 50,
      suffix: 'K+',
      label: t('about.stats.members', 'Miembros'),
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${navyColor} 0%, #0A1535 50%, #060D26 100%)`,
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 10% 20%, ${alpha(goldColor, 0.08)} 0%, transparent 40%),
                           radial-gradient(circle at 90% 80%, ${alpha(goldColor, 0.05)} 0%, transparent 40%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Grid pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${alpha('#FFFFFF', 0.02)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha('#FFFFFF', 0.02)} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        {/* Section header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="overline"
            sx={{
              color: goldColor,
              letterSpacing: 4,
              fontWeight: 600,
              mb: 2,
              display: 'block',
            }}
          >
            {t('about.stats.label', 'NUESTRO IMPACTO')}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              color: '#FFFFFF',
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            {t('about.stats.title', 'Transformando Vidas')}
          </Typography>
        </Box>

        {/* Stats grid */}
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <StatItem
                icon={stat.icon}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                delay={index * 0.2}
              />
            </Grid>
          ))}
        </Grid>

        {/* Bottom quote */}
        <Box
          sx={{
            mt: 8,
            pt: 6,
            borderTop: `1px solid ${alpha(goldColor, 0.2)}`,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              color: alpha('#FFFFFF', 0.9),
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.4rem' },
            }}
          >
            "{t('about.stats.quote', 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.')}"
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: goldColor,
              mt: 2,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            {t('about.stats.quoteReference', 'JUAN 3:16')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ImpactStats;
