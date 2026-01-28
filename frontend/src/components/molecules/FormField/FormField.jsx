import React from 'react';
import PropTypes from 'prop-types';
import { Box, FormHelperText } from '@mui/material';
import Typography from '../../atoms/Typography/Typography';
import Input from '../../atoms/Input/Input';

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
}) => (
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

FormField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  description: PropTypes.string,
  required: PropTypes.bool,
  type: PropTypes.string,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  InputProps: PropTypes.object,
};

export default FormField;
