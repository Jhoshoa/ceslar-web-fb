import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';

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
}) => (
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

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  type: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  InputProps: PropTypes.object,
};

export default Input;
