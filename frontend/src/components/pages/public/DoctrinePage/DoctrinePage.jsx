import React from 'react';
import { Container, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import Typography from '../../../atoms/Typography/Typography';

const DoctrinePage = () => {
  const { t } = useTranslation();

  const doctrines = [
    {
      title: t('doctrine.bible.title', 'La Biblia'),
      content: t('doctrine.bible.content', 'Creemos que la Biblia es la Palabra de Dios, inspirada, infalible y autoritativa para la fe y la conducta.'),
    },
    {
      title: t('doctrine.god.title', 'Dios'),
      content: t('doctrine.god.content', 'Creemos en un solo Dios, eternamente existente en tres personas: Padre, Hijo y Espíritu Santo.'),
    },
    {
      title: t('doctrine.jesus.title', 'Jesucristo'),
      content: t('doctrine.jesus.content', 'Creemos en la deidad de nuestro Señor Jesucristo, su nacimiento virginal, su vida sin pecado, sus milagros, su muerte vicaria y expiatoria, su resurrección corporal, su ascensión a la diestra del Padre, y su regreso personal en poder y gloria.'),
    },
    {
      title: t('doctrine.salvation.title', 'La Salvación'),
      content: t('doctrine.salvation.content', 'Creemos que la salvación es por gracia mediante la fe en Jesucristo, no por obras, para que nadie se gloríe.'),
    },
    {
      title: t('doctrine.holySpirit.title', 'El Espíritu Santo'),
      content: t('doctrine.holySpirit.content', 'Creemos en el ministerio presente del Espíritu Santo, por cuya morada el cristiano es capacitado para vivir una vida santa.'),
    },
    {
      title: t('doctrine.church.title', 'La Iglesia'),
      content: t('doctrine.church.content', 'Creemos que la Iglesia es el cuerpo de Cristo, compuesta por todos los creyentes, y que su misión es proclamar el evangelio a todas las naciones.'),
    },
    {
      title: t('doctrine.return.title', 'La Segunda Venida'),
      content: t('doctrine.return.content', 'Creemos en el retorno personal y visible de Jesucristo para juzgar a los vivos y a los muertos.'),
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {t('doctrine.title', 'Lo Que Creemos')}
      </Typography>
      <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
        {t('doctrine.subtitle', 'Nuestra declaración de fe y principios doctrinales')}
      </Typography>

      <Box>
        {doctrines.map((doctrine, index) => (
          <Accordion key={index} defaultExpanded={index === 0} elevation={1} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {doctrine.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="textSecondary">
                {doctrine.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default DoctrinePage;
