import { ReactNode, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Collapse,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Typography from '../../atoms/Typography/Typography';
import Button from '../../atoms/Button/Button';
import LocalizedStringInput from '../LocalizedStringInput/LocalizedStringInput';

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

type ServiceType =
  | 'main_service'
  | 'bible_study'
  | 'prayer_meeting'
  | 'youth_meeting'
  | 'women_meeting'
  | 'men_meeting'
  | 'children_service'
  | 'worship_night'
  | 'special_service';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
}

interface ServiceSchedule {
  day: DayOfWeek;
  time: string;
  endTime: string;
  type: ServiceType;
  name: LocalizedString;
  description?: LocalizedString;
  isActive?: boolean;
}

interface ServiceScheduleManagerProps {
  label?: string;
  name: string;
  value?: ServiceSchedule[];
  onChange: (schedules: ServiceSchedule[]) => void;
  error?: string;
  helperText?: string;
  description?: string;
  disabled?: boolean;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'sunday', label: 'Domingo' },
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
];

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'main_service', label: 'Servicio Principal' },
  { value: 'bible_study', label: 'Estudio Bíblico' },
  { value: 'prayer_meeting', label: 'Reunión de Oración' },
  { value: 'youth_meeting', label: 'Reunión de Jóvenes' },
  { value: 'women_meeting', label: 'Reunión de Mujeres' },
  { value: 'men_meeting', label: 'Reunión de Varones' },
  { value: 'children_service', label: 'Servicio de Niños' },
  { value: 'worship_night', label: 'Noche de Alabanza' },
  { value: 'special_service', label: 'Servicio Especial' },
];

const DEFAULT_SCHEDULE: ServiceSchedule = {
  day: 'sunday',
  time: '10:00',
  endTime: '12:00',
  type: 'main_service',
  name: { es: '', en: '', pt: '' },
  isActive: true,
};

const ServiceScheduleManager = ({
  label,
  name,
  value = [],
  onChange,
  error,
  helperText,
  description,
  disabled = false,
}: ServiceScheduleManagerProps): ReactNode => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const newSchedules = [...value, { ...DEFAULT_SCHEDULE }];
    onChange(newSchedules);
    setExpandedIndex(newSchedules.length - 1);
  };

  const handleRemove = (index: number) => {
    const newSchedules = value.filter((_, i) => i !== index);
    onChange(newSchedules);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const handleUpdate = (index: number, field: keyof ServiceSchedule, fieldValue: unknown) => {
    const newSchedules = [...value];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: fieldValue,
    };
    onChange(newSchedules);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getDayLabel = (day: DayOfWeek) => {
    return DAYS_OF_WEEK.find((d) => d.value === day)?.label || day;
  };

  const getTypeLabel = (type: ServiceType) => {
    return SERVICE_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <AccessTimeIcon fontSize="small" color="action" />
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontWeight: 500 }}
          >
            {label}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {value.map((schedule, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              overflow: 'hidden',
              borderColor: expandedIndex === index ? 'primary.main' : 'divider',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                bgcolor: 'action.hover',
                cursor: 'pointer',
              }}
              onClick={() => toggleExpand(index)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {expandedIndex === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {getDayLabel(schedule.day)} - {schedule.time} a {schedule.endTime}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  ({getTypeLabel(schedule.type)})
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                disabled={disabled}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Expanded Content */}
            <Collapse in={expandedIndex === index}>
              <Box sx={{ p: 2, pt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small" disabled={disabled}>
                      <InputLabel>Día</InputLabel>
                      <Select
                        value={schedule.day}
                        label="Día"
                        onChange={(e: SelectChangeEvent) =>
                          handleUpdate(index, 'day', e.target.value)
                        }
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <MenuItem key={day.value} value={day.value}>
                            {day.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <TextField
                      label="Hora inicio"
                      type="time"
                      value={schedule.time}
                      onChange={(e) => handleUpdate(index, 'time', e.target.value)}
                      disabled={disabled}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <TextField
                      label="Hora fin"
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => handleUpdate(index, 'endTime', e.target.value)}
                      disabled={disabled}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" disabled={disabled}>
                      <InputLabel>Tipo de servicio</InputLabel>
                      <Select
                        value={schedule.type}
                        label="Tipo de servicio"
                        onChange={(e: SelectChangeEvent) =>
                          handleUpdate(index, 'type', e.target.value)
                        }
                      >
                        {SERVICE_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <LocalizedStringInput
                      label="Nombre del servicio"
                      name={`${name}[${index}].name`}
                      value={schedule.name}
                      onChange={(val) => handleUpdate(index, 'name', val)}
                      placeholder="Ej: Servicio Dominical"
                      disabled={disabled}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <LocalizedStringInput
                      label="Descripción (opcional)"
                      name={`${name}[${index}].description`}
                      value={schedule.description || {}}
                      onChange={(val) => handleUpdate(index, 'description', val)}
                      multiline
                      rows={2}
                      placeholder="Descripción del servicio..."
                      disabled={disabled}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Paper>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={disabled}
          sx={{ alignSelf: 'flex-start' }}
        >
          Agregar horario
        </Button>
      </Box>

      {error && (
        <FormHelperText error sx={{ mt: 0.5 }}>
          {error}
        </FormHelperText>
      )}
      {description && !error && (
        <FormHelperText sx={{ mt: 0.5 }}>{description}</FormHelperText>
      )}
      {helperText && !error && (
        <FormHelperText sx={{ mt: 0.5 }}>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

export default ServiceScheduleManager;
