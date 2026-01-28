/**
 * Royal Theme Palette
 *
 * A majestic color scheme inspired by royalty:
 * - Primary: Deep royal blue - represents trust, faith, and divinity
 * - Secondary: Royal gold - represents glory, wisdom, and the divine
 * - Accent: Rich crimson red - represents the blood of Christ and sacrifice
 */

const palette = {
  light: {
    primary: {
      main: '#0D1B4C',      // Deep royal blue
      light: '#1E3A8A',     // Royal blue
      dark: '#060D26',      // Midnight blue
      lighter: '#E8EBF5',   // Light royal blue tint
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D4AF37',      // Royal gold
      light: '#E5C76B',     // Light gold
      dark: '#AA8B2C',      // Dark gold
      lighter: '#FDF6E3',   // Cream gold tint
      contrastText: '#0D1B4C',
    },
    accent: {
      main: '#B22222',      // Firebrick red
      light: '#DC3545',     // Bright red
      dark: '#8B0000',      // Dark red
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    error: {
      main: '#B22222',
      light: '#DC3545',
      dark: '#8B0000',
    },
    warning: {
      main: '#D4AF37',
      light: '#E5C76B',
      dark: '#AA8B2C',
    },
    info: {
      main: '#1E3A8A',
      light: '#3B82F6',
      dark: '#0D1B4C',
    },
    background: {
      default: '#F8F9FC',
      paper: '#FFFFFF',
      dark: '#0D1B4C',
      gradient: 'linear-gradient(135deg, #0D1B4C 0%, #1E3A8A 50%, #0D1B4C 100%)',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#4A4A68',
      light: '#FFFFFF',
      gold: '#D4AF37',
    },
    divider: '#E0E0E0',
    // Custom royal colors for special sections
    royal: {
      navy: '#0D1B4C',
      blue: '#1E3A8A',
      gold: '#D4AF37',
      goldLight: '#E5C76B',
      crimson: '#B22222',
      cream: '#FDF6E3',
      pearl: '#F8F9FC',
    },
  },
  dark: {
    primary: {
      main: '#3B82F6',      // Bright blue for dark mode
      light: '#60A5FA',
      dark: '#1E3A8A',
      lighter: '#1E293B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E5C76B',      // Lighter gold for dark mode
      light: '#F5DFA3',
      dark: '#D4AF37',
      lighter: '#2D2A1E',
      contrastText: '#0D1B4C',
    },
    accent: {
      main: '#DC3545',
      light: '#EF4444',
      dark: '#B22222',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    error: {
      main: '#DC3545',
      light: '#EF4444',
      dark: '#B22222',
    },
    warning: {
      main: '#E5C76B',
      light: '#F5DFA3',
      dark: '#D4AF37',
    },
    info: {
      main: '#60A5FA',
      light: '#93C5FD',
      dark: '#3B82F6',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
      dark: '#060D26',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      light: '#FFFFFF',
      gold: '#E5C76B',
    },
    divider: '#334155',
    royal: {
      navy: '#1E293B',
      blue: '#3B82F6',
      gold: '#E5C76B',
      goldLight: '#F5DFA3',
      crimson: '#DC3545',
      cream: '#2D2A1E',
      pearl: '#0F172A',
    },
  },
};

export default palette;
