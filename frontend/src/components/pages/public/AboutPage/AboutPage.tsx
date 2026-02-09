/**
 * AboutPage
 *
 * A comprehensive page showcasing the church's history, mission, vision,
 * values, and foundational principles. Features a modern, elegant design
 * with smooth animations and a cohesive visual identity.
 */

import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  AboutHero,
  MissionVisionSection,
  HistoryTimeline,
  ValuesSection,
  PrinciplesSection,
  ImpactStats,
} from '../../../organisms/about';
import CallToActionSection from '../../../organisms/home/CallToActionSection/CallToActionSection';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('about.meta.title', 'Sobre Nosotros | Cristo Es La Respuesta')}</title>
        <meta
          name="description"
          content={t(
            'about.meta.description',
            'Conoce la historia, misión, visión y valores de Cristo Es La Respuesta. Más de 55 años transformando vidas en Bolivia y Sudamérica.'
          )}
        />
        <meta
          name="keywords"
          content="Cristo Es La Respuesta, iglesia, Bolivia, historia, misión, visión, valores, principios"
        />
      </Helmet>

      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Hero Section */}
        <AboutHero />

        {/* Mission & Vision */}
        <MissionVisionSection />

        {/* Impact Statistics */}
        <ImpactStats />

        {/* History Timeline */}
        <HistoryTimeline />

        {/* Core Values */}
        <ValuesSection />

        {/* Foundational Principles */}
        <PrinciplesSection />

        {/* Call to Action */}
        <CallToActionSection />
      </Box>
    </>
  );
};

export default AboutPage;
