import { createTheme, Theme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import components from './components';

type ThemeMode = 'light' | 'dark';

export const createAppTheme = (mode: ThemeMode = 'light'): Theme =>
  createTheme({
    palette: {
      mode,
      ...palette[mode],
    },
    typography,
    components,
    shape: {
      borderRadius: 8,
    },
  });

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

export default lightTheme;
