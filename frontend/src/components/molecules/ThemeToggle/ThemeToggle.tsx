import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTranslation } from 'react-i18next';

type ThemeMode = 'light' | 'dark';
type ToggleSize = 'small' | 'medium' | 'large';

interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
  size?: ToggleSize;
}

const ThemeToggle = ({ mode, onToggle, size = 'medium' }: ThemeToggleProps) => {
  const { t } = useTranslation();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? t('theme.lightMode', 'Modo claro') : t('theme.darkMode', 'Modo oscuro')}>
      <IconButton onClick={onToggle} size={size} color="inherit">
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
