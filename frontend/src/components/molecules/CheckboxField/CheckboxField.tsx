import { ReactNode, ChangeEvent } from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import Typography from '../../atoms/Typography/Typography';

interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  description?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const CheckboxField = ({
  label,
  name,
  checked,
  onChange,
  error,
  helperText,
  description,
  disabled = false,
  size = 'medium',
}: CheckboxFieldProps): ReactNode => (
  <Box sx={{ mb: 2 }}>
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          size={size}
        />
      }
      label={
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      }
    />
    {(error || helperText || description) && (
      <FormHelperText error={!!error} sx={{ ml: 0 }}>
        {error || helperText || description}
      </FormHelperText>
    )}
  </Box>
);

export default CheckboxField;
