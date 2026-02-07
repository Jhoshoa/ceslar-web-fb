import { ChangeEvent, ReactNode } from 'react';
import { Box, FormHelperText, InputProps as MuiInputProps } from '@mui/material';
import Typography from '../../atoms/Typography/Typography';
import Input from '../../atoms/Input/Input';

type FormFieldSize = 'small' | 'medium';

interface FormFieldProps {
  label?: string;
  name: string;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  description?: string;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: FormFieldSize;
  InputProps?: Partial<MuiInputProps>;
}

const FormField = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  description,
  required = false,
  type = 'text',
  multiline = false,
  rows,
  placeholder,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  InputProps,
  ...props
}: FormFieldProps): ReactNode => (
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
    <Input
      name={name}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText}
      required={required}
      type={type}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      InputProps={InputProps}
      {...props}
    />
    {description && !error && (
      <FormHelperText sx={{ mt: 0.5 }}>{description}</FormHelperText>
    )}
  </Box>
);

export default FormField;
