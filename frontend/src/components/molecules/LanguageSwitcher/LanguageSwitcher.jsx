import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
];

const LanguageSwitcher = ({ size = 'small', sx }) => {
  const { i18n } = useTranslation();

  const handleChange = (_, newLang) => {
    if (newLang) i18n.changeLanguage(newLang);
  };

  return (
    <ToggleButtonGroup
      value={i18n.language?.split('-')[0] || 'es'}
      exclusive
      onChange={handleChange}
      size={size}
      sx={sx}
    >
      {LANGUAGES.map(({ code, label }) => (
        <ToggleButton key={code} value={code} sx={{ px: 1.5, py: 0.5 }}>
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default LanguageSwitcher;
