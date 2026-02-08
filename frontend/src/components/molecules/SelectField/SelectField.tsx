import { ReactNode } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import Typography from '../../atoms/Typography/Typography';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  placeholder?: string;
}

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  helperText,
  description,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  placeholder,
}: SelectFieldProps): ReactNode => (
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
    <FormControl fullWidth={fullWidth} size={size} error={!!error} disabled={disabled}>
      {placeholder && !label && <InputLabel>{placeholder}</InputLabel>}
      <Select
        name={name}
        value={value}
        onChange={onChange}
        displayEmpty={!!placeholder}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <Typography color="textSecondary">{placeholder}</Typography>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText error={!!error}>{error || helperText}</FormHelperText>
      )}
    </FormControl>
    {description && !error && (
      <FormHelperText sx={{ mt: 0.5 }}>{description}</FormHelperText>
    )}
  </Box>
);

export default SelectField;
