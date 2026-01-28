/**
 * Royal Theme Component Overrides
 *
 * Custom styling for MUI components to match the royal theme
 */

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollBehavior: 'smooth',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(13, 27, 76, 0.2)',
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        '&.MuiButton-containedPrimary': {
          background: 'linear-gradient(135deg, #0D1B4C 0%, #1E3A8A 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E3A8A 0%, #0D1B4C 100%)',
          },
        },
        '&.MuiButton-containedSecondary': {
          background: 'linear-gradient(135deg, #D4AF37 0%, #E5C76B 100%)',
          color: '#0D1B4C',
          '&:hover': {
            background: 'linear-gradient(135deg, #E5C76B 0%, #D4AF37 100%)',
          },
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
        '&.MuiButton-outlinedSecondary': {
          borderColor: '#D4AF37',
          color: '#D4AF37',
          '&:hover': {
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            borderColor: '#E5C76B',
          },
        },
      },
      sizeLarge: {
        padding: '14px 32px',
        fontSize: '1.1rem',
      },
      sizeMedium: {
        padding: '10px 24px',
      },
      sizeSmall: {
        padding: '6px 16px',
        fontSize: '0.875rem',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(13, 27, 76, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(13, 27, 76, 0.12)',
          transform: 'translateY(-4px)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(13, 27, 76, 0.06)',
      },
      elevation2: {
        boxShadow: '0 4px 16px rgba(13, 27, 76, 0.08)',
      },
      elevation3: {
        boxShadow: '0 8px 24px rgba(13, 27, 76, 0.1)',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1E3A8A',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0D1B4C',
            borderWidth: 2,
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
      colorPrimary: {
        backgroundColor: '#E8EBF5',
        color: '#0D1B4C',
      },
      colorSecondary: {
        backgroundColor: '#FDF6E3',
        color: '#AA8B2C',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
        boxShadow: '0 24px 48px rgba(13, 27, 76, 0.15)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
        boxShadow: '4px 0 20px rgba(13, 27, 76, 0.08)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        boxShadow: '0 2px 10px rgba(13, 27, 76, 0.06)',
        borderRadius: 0,
      },
      colorDefault: {
        backgroundColor: '#FFFFFF',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        margin: '2px 8px',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(13, 27, 76, 0.04)',
        },
        '&.Mui-selected': {
          fontWeight: 600,
          backgroundColor: 'rgba(13, 27, 76, 0.08)',
          '&:hover': {
            backgroundColor: 'rgba(13, 27, 76, 0.12)',
          },
        },
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 700,
          backgroundColor: '#F8F9FC',
          color: '#0D1B4C',
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '1rem',
        '&.Mui-selected': {
          fontWeight: 700,
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      standardSuccess: {
        backgroundColor: '#E8F5E9',
        color: '#1B5E20',
      },
      standardError: {
        backgroundColor: '#FFEBEE',
        color: '#B22222',
      },
      standardWarning: {
        backgroundColor: '#FDF6E3',
        color: '#AA8B2C',
      },
      standardInfo: {
        backgroundColor: '#E8EBF5',
        color: '#0D1B4C',
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 600,
      },
      colorDefault: {
        backgroundColor: '#E8EBF5',
        color: '#0D1B4C',
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(13, 27, 76, 0.08)',
      },
      wave: {
        '&::after': {
          background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.08), transparent)',
        },
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: 'rgba(13, 27, 76, 0.08)',
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: '#1E3A8A',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        '&:hover': {
          color: '#D4AF37',
          textDecoration: 'underline',
        },
      },
    },
  },
};

export default components;
