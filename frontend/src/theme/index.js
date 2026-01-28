import { createTheme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import components from './components';

export const createAppTheme = (mode = 'light') =>
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
