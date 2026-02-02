import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Input from '../../atoms/Input/Input';

type SearchInputSize = 'small' | 'medium';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: SearchInputSize;
}

const SearchInput = ({
  value: externalValue,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  debounceMs = 300,
  disabled = false,
  fullWidth = true,
  size = 'small',
  ...props
}: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(externalValue || '');
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (externalValue !== undefined) setLocalValue(externalValue);
  }, [externalValue]);

  const debouncedSearch = useCallback(
    (searchValue: string) => {
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(() => {
        onSearch?.(searchValue);
      }, debounceMs);
      setTimer(newTimer);
    },
    [onSearch, debounceMs, timer],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
    onSearch?.('');
  };

  return (
    <Input
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: localValue ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      {...props}
    />
  );
};

export default SearchInput;
