import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Algo salió mal
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  mb: 3,
                  textAlign: 'left',
                  overflow: 'auto',
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </Typography>
              </Box>
            )}
            <Button variant="contained" onClick={this.handleReload}>
              Recargar Página
            </Button>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
