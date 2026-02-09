/**
 * PrinciplesSection Organism
 *
 * Displays the church's foundational principles organized by category.
 * Features a tabbed interface with smooth transitions between categories.
 */

import { useState } from 'react';
import { Box, Container, Tab, Tabs, alpha, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SectionTitle from '../../atoms/SectionTitle/SectionTitle';
import PrincipleCard from '../../molecules/PrincipleCard/PrincipleCard';

// Icons
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    sx={{
      opacity: value === index ? 1 : 0,
      transform: value === index ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.4s ease',
    }}
  >
    {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
  </Box>
);

const PrinciplesSection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const goldColor = '#D4AF37';
  const navyColor = '#0D1B4C';

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const categories = [
    {
      id: 'religious',
      label: t('about.principles.religious.label', 'Principios Religiosos'),
      icon: <AutoStoriesIcon />,
      color: goldColor,
      principles: [
        {
          title: t('about.principles.religious.trinity.title', 'La Trinidad'),
          items: [
            t('about.principles.religious.trinity.item1', 'Creemos en un solo Dios verdadero, manifestado en tres personas: Padre, Hijo y Espíritu Santo.'),
            t('about.principles.religious.trinity.item2', 'Jesucristo es Dios hecho carne, la manifestación visible del Dios invisible.'),
          ],
        },
        {
          title: t('about.principles.religious.salvation.title', 'La Salvación'),
          items: [
            t('about.principles.religious.salvation.item1', 'La salvación es por gracia mediante la fe en Jesucristo.'),
            t('about.principles.religious.salvation.item2', 'Todo ser humano necesita arrepentimiento y conversión personal.'),
            t('about.principles.religious.salvation.item3', 'El bautismo en agua es por inmersión, en el nombre de Jesús.'),
          ],
        },
        {
          title: t('about.principles.religious.holySpirit.title', 'El Espíritu Santo'),
          items: [
            t('about.principles.religious.holySpirit.item1', 'Creemos en el bautismo del Espíritu Santo con la evidencia de hablar en otras lenguas.'),
            t('about.principles.religious.holySpirit.item2', 'Los dones del Espíritu Santo están vigentes para la iglesia de hoy.'),
          ],
        },
        {
          title: t('about.principles.religious.secondComing.title', 'Segunda Venida'),
          items: [
            t('about.principles.religious.secondComing.item1', 'Creemos en la segunda venida literal y visible de Jesucristo.'),
            t('about.principles.religious.secondComing.item2', 'El establecimiento del reino milenial de paz y justicia.'),
          ],
        },
      ],
    },
    {
      id: 'moral',
      label: t('about.principles.moral.label', 'Principios Morales'),
      icon: <FavoriteIcon />,
      color: '#B91C1C',
      principles: [
        {
          title: t('about.principles.moral.family.title', 'La Familia'),
          items: [
            t('about.principles.moral.family.item1', 'El matrimonio es la unión sagrada entre un hombre y una mujer.'),
            t('about.principles.moral.family.item2', 'Los hijos son herencia del Señor y deben ser criados en sus caminos.'),
            t('about.principles.moral.family.item3', 'El hogar es la base fundamental de la sociedad.'),
          ],
        },
        {
          title: t('about.principles.moral.integrity.title', 'La Integridad'),
          items: [
            t('about.principles.moral.integrity.item1', 'Vivimos con honestidad y transparencia en todas las áreas.'),
            t('about.principles.moral.integrity.item2', 'Rechazamos toda forma de corrupción y engaño.'),
            t('about.principles.moral.integrity.item3', 'Nuestra palabra debe ser nuestro compromiso.'),
          ],
        },
        {
          title: t('about.principles.moral.love.title', 'El Amor al Prójimo'),
          items: [
            t('about.principles.moral.love.item1', 'Servimos a los necesitados sin distinción de raza, credo o condición.'),
            t('about.principles.moral.love.item2', 'Practicamos el perdón y la reconciliación.'),
          ],
        },
      ],
    },
    {
      id: 'civil',
      label: t('about.principles.civil.label', 'Principios Civiles'),
      icon: <AccountBalanceIcon />,
      color: navyColor,
      principles: [
        {
          title: t('about.principles.civil.respect.title', 'Respeto a las Autoridades'),
          items: [
            t('about.principles.civil.respect.item1', 'Respetamos y obedecemos las leyes civiles de cada país donde operamos.'),
            t('about.principles.civil.respect.item2', 'Oramos por las autoridades gubernamentales.'),
            t('about.principles.civil.respect.item3', 'Cumplimos con nuestras obligaciones fiscales y legales.'),
          ],
        },
        {
          title: t('about.principles.civil.citizenship.title', 'Ciudadanía Responsable'),
          items: [
            t('about.principles.civil.citizenship.item1', 'Participamos constructivamente en la sociedad.'),
            t('about.principles.civil.citizenship.item2', 'Promovemos la paz y la convivencia armónica.'),
            t('about.principles.civil.citizenship.item3', 'Contribuimos al bienestar de nuestras comunidades.'),
          ],
        },
        {
          title: t('about.principles.civil.transparency.title', 'Transparencia Institucional'),
          items: [
            t('about.principles.civil.transparency.item1', 'Nuestra organización opera con total transparencia financiera.'),
            t('about.principles.civil.transparency.item2', 'Rendimos cuentas a nuestros miembros y a las autoridades competentes.'),
          ],
        },
      ],
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, #F8F9FC 0%, #FFFFFF 50%, #F8F9FC 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          background: `radial-gradient(ellipse at 50% 0%, ${alpha(goldColor, 0.05)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <SectionTitle
          label={t('about.principles.label', 'NUESTROS FUNDAMENTOS')}
          title={t('about.principles.title', 'Principios Doctrinales')}
          subtitle={t(
            'about.principles.subtitle',
            'Las bases espirituales, morales y cívicas que rigen nuestra fe y conducta'
          )}
        />

        {/* Tabs */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 2,
                bgcolor: categories[activeTab].color,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9rem', md: '1rem' },
                color: 'text.secondary',
                minWidth: { xs: 'auto', md: 180 },
                px: { xs: 2, md: 3 },
                py: 2,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: categories[activeTab].color,
                },
                '&:hover': {
                  color: categories[activeTab].color,
                  bgcolor: alpha(categories[activeTab].color, 0.05),
                },
              },
            }}
          >
            {categories.map((category, index) => (
              <Tab
                key={category.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        '& svg': {
                          fontSize: 20,
                          color: activeTab === index ? category.color : 'inherit',
                        },
                      }}
                    >
                      {category.icon}
                    </Box>
                    <span>{category.label}</span>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {categories.map((category, index) => (
          <TabPanel key={category.id} value={activeTab} index={index}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              {category.principles.map((principle, principleIndex) => (
                <PrincipleCard
                  key={principleIndex}
                  title={principle.title}
                  items={principle.items}
                  color={category.color}
                  delay={principleIndex * 0.1}
                />
              ))}
            </Box>
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};

export default PrinciplesSection;
