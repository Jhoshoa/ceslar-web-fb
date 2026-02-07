import { Suspense } from 'react';
import { Box, Container, Paper, CircularProgress } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Typography from '../../atoms/Typography/Typography';

// Content-level loading component
const ContentLoader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
    }}
  >
    <CircularProgress />
  </Box>
);

interface AuthLayoutProps {
  title?: string;
}

const AuthLayout = ({ title = 'Cristo Es La Respuesta' }: AuthLayoutProps) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      py: 4,
    }}
  >
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {title}
        </Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </Paper>
    </Container>
  </Box>
);

export default AuthLayout;
