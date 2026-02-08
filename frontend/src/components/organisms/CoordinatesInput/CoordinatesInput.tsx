import { ReactNode, ChangeEvent } from 'react';
import { Box, Grid, TextField, FormHelperText } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Typography from '../../atoms/Typography/Typography';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface CoordinatesInputProps {
  label?: string;
  name: string;
  value?: Coordinates | null;
  onChange: (coordinates: Coordinates | null) => void;
  error?: string | { latitude?: string; longitude?: string };
  helperText?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

const CoordinatesInput = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  description,
  required = false,
  disabled = false,
}: CoordinatesInputProps): ReactNode => {
  const handleLatChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    if (isNaN(lat) && !e.target.value) {
      if (!value?.longitude) {
        onChange(null);
      } else {
        onChange({ latitude: 0, longitude: value.longitude });
      }
      return;
    }
    onChange({
      latitude: isNaN(lat) ? 0 : lat,
      longitude: value?.longitude || 0,
    });
  };

  const handleLngChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value);
    if (isNaN(lng) && !e.target.value) {
      if (!value?.latitude) {
        onChange(null);
      } else {
        onChange({ latitude: value.latitude, longitude: 0 });
      }
      return;
    }
    onChange({
      latitude: value?.latitude || 0,
      longitude: isNaN(lng) ? 0 : lng,
    });
  };

  const getErrorString = (): string | undefined => {
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error) {
      return error.latitude || error.longitude;
    }
    return undefined;
  };

  const getLatError = (): string | undefined => {
    if (typeof error === 'object' && error) return error.latitude;
    return undefined;
  };

  const getLngError = (): string | undefined => {
    if (typeof error === 'object' && error) return error.longitude;
    return undefined;
  };

  const errorString = getErrorString();

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontWeight: 500 }}
          >
            {label}
            {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            name={`${name}.latitude`}
            label="Latitude"
            type="number"
            value={value?.latitude ?? ''}
            onChange={handleLatChange}
            error={!!getLatError()}
            helperText={getLatError()}
            disabled={disabled}
            fullWidth
            size="small"
            inputProps={{
              step: 'any',
              min: -90,
              max: 90,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name={`${name}.longitude`}
            label="Longitude"
            type="number"
            value={value?.longitude ?? ''}
            onChange={handleLngChange}
            error={!!getLngError()}
            helperText={getLngError()}
            disabled={disabled}
            fullWidth
            size="small"
            inputProps={{
              step: 'any',
              min: -180,
              max: 180,
            }}
          />
        </Grid>
      </Grid>

      {errorString && typeof error === 'string' && (
        <FormHelperText error sx={{ mt: 0.5 }}>
          {errorString}
        </FormHelperText>
      )}
      {description && !errorString && (
        <FormHelperText sx={{ mt: 0.5 }}>{description}</FormHelperText>
      )}
      {helperText && !errorString && (
        <FormHelperText sx={{ mt: 0.5 }}>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

export default CoordinatesInput;
