import { ChangeEvent } from 'react';
import { TextField, TextFieldProps, InputProps as MuiInputProps } from '@mui/material';

type InputSize = 'small' | 'medium';

interface InputProps extends Omit<TextFieldProps, 'variant' | 'size'> {
  label?: string;
  name?: string;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  size?: InputSize;
  disabled?: boolean;
  placeholder?: string;
  InputProps?: Partial<MuiInputProps>;
}

const Input = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  error = false,
  helperText,
  required = false,
  multiline = false,
  rows = 4,
  fullWidth = true,
  size = 'medium',
  disabled = false,
  placeholder,
  InputProps,
  ...props
}: InputProps) => (
  <TextField
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    type={type}
    error={error}
    helperText={helperText}
    required={required}
    multiline={multiline}
    rows={multiline ? rows : undefined}
    fullWidth={fullWidth}
    size={size}
    disabled={disabled}
    placeholder={placeholder}
    InputProps={InputProps}
    variant="outlined"
    {...props}
  />
);

export default Input;
