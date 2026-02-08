/**
 * LocalizedRichTextInput Organism
 *
 * Rich text editor with language tabs for multilingual content.
 */

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import Typography from '../../atoms/Typography/Typography';
import RichTextEditor from '../RichTextEditor/RichTextEditor';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
}

interface LocalizedRichTextInputProps {
  label?: string;
  name: string;
  value?: LocalizedString;
  onChange: (value: LocalizedString) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
];

const LocalizedRichTextInput = ({
  label,
  name,
  value = { es: '', en: '', pt: '' },
  onChange,
  required = false,
  error,
  placeholder,
  minHeight = 200,
  maxHeight = 400,
  disabled = false,
}: LocalizedRichTextInputProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLanguageChange = (lang: string, newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue,
    });
  };

  const currentLang = LANGUAGES[activeTab].code;

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            mb: 1,
            color: error ? 'error.main' : 'text.primary',
          }}
        >
          {label}
          {required && (
            <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
              *
            </Box>
          )}
        </Typography>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="standard"
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              px: 2,
              fontSize: '0.75rem',
            },
          }}
        >
          {LANGUAGES.map((lang) => (
            <Tab
              key={lang.code}
              label={lang.label}
              sx={{
                '&.Mui-selected': {
                  fontWeight: 600,
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {LANGUAGES.map((lang, index) => (
        <Box
          key={lang.code}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`${name}-tabpanel-${lang.code}`}
        >
          {activeTab === index && (
            <RichTextEditor
              name={`${name}.${lang.code}`}
              value={value[lang.code as keyof LocalizedString] || ''}
              onChange={(newValue) => handleLanguageChange(lang.code, newValue)}
              placeholder={placeholder || `Escribe en ${lang.label}...`}
              minHeight={minHeight}
              maxHeight={maxHeight}
              disabled={disabled}
            />
          )}
        </Box>
      ))}

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default LocalizedRichTextInput;
