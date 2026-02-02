import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtonGroup, ToggleButton, SxProps, Theme } from '@mui/material';

interface Language {
  code: string;
  label: string;
}

const LANGUAGES: Language[] = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
];

interface LanguageSwitcherProps {
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

const LanguageSwitcher = ({ size = 'small', sx }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const handleChange = (_event: MouseEvent<HTMLElement>, newLang: string | null) => {
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
