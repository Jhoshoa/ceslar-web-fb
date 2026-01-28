import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTranslation } from 'react-i18next';

const ThemeToggle = ({ mode, onToggle, size = 'medium' }) => {
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

ThemeToggle.propTypes = {
  mode: PropTypes.oneOf(['light', 'dark']).isRequired,
  onToggle: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default ThemeToggle;
