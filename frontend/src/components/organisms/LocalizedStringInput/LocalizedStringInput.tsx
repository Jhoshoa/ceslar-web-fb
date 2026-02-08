import { useState, ReactNode } from 'react';
import { Box, Tabs, Tab, TextField, FormHelperText } from '@mui/material';
import Typography from '../../atoms/Typography/Typography';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
}

type LanguageCode = 'es' | 'en' | 'pt';

interface LocalizedStringInputProps {
  label?: string;
  name: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  error?: string | Record<string, string>;
  helperText?: string;
  description?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
}

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
];

const LocalizedStringInput = ({
  label,
  name,
  value = {},
  onChange,
  error,
  helperText,
  description,
  required = false,
  multiline = false,
  rows = 3,
  placeholder,
  disabled = false,
}: LocalizedStringInputProps): ReactNode => {
  const [activeTab, setActiveTab] = useState<LanguageCode>('es');

  const handleChange = (lang: LanguageCode, text: string) => {
    onChange({
      ...value,
      [lang]: text,
    });
  };

  const getErrorForLang = (lang: LanguageCode): string | undefined => {
    if (typeof error === 'string') return lang === 'es' ? error : undefined;
    if (typeof error === 'object' && error) return error[lang];
    return undefined;
  };

  const hasAnyError = typeof error === 'string' || (typeof error === 'object' && error && Object.keys(error).length > 0);

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          {label}
          {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
        </Typography>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ minHeight: 36 }}
        >
          {LANGUAGES.map((lang) => (
            <Tab
              key={lang.code}
              value={lang.code}
              label={lang.label}
              sx={{
                minHeight: 36,
                py: 0.5,
                fontSize: '0.8rem',
                color: getErrorForLang(lang.code) ? 'error.main' : 'inherit',
              }}
            />
          ))}
        </Tabs>
      </Box>

      {LANGUAGES.map((lang) => (
        <Box
          key={lang.code}
          sx={{ display: activeTab === lang.code ? 'block' : 'none' }}
        >
          <TextField
            name={`${name}.${lang.code}`}
            value={value[lang.code] || ''}
            onChange={(e) => handleChange(lang.code, e.target.value)}
            error={!!getErrorForLang(lang.code)}
            helperText={getErrorForLang(lang.code)}
            multiline={multiline}
            rows={rows}
            placeholder={placeholder ? `${placeholder} (${lang.label})` : undefined}
            disabled={disabled}
            fullWidth
            size="small"
          />
        </Box>
      ))}

      {description && !hasAnyError && (
        <FormHelperText sx={{ mt: 0.5 }}>{description}</FormHelperText>
      )}
      {helperText && !hasAnyError && (
        <FormHelperText sx={{ mt: 0.5 }}>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

export default LocalizedStringInput;
