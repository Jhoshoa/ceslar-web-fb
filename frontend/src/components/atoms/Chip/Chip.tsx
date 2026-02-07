import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';

export type ChipProps = MuiChipProps;

const Chip = (props: ChipProps) => <MuiChip {...props} />;

export default Chip;
