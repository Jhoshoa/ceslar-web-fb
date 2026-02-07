import { CircularProgress, Box } from '@mui/material';

type SpinnerColor = 'primary' | 'secondary' | 'inherit';

interface SpinnerProps {
  size?: number;
  color?: SpinnerColor;
  centered?: boolean;
  fullPage?: boolean;
}

const Spinner = ({
  size = 40,
  color = 'primary',
  centered = false,
  fullPage = false,
  ...props
}: SpinnerProps) => {
  const spinner = <CircularProgress size={size} color={color} {...props} />;

  if (fullPage) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        {spinner}
      </Box>
    );
  }

  if (centered) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        {spinner}
      </Box>
    );
  }

  return spinner;
};

export default Spinner;
