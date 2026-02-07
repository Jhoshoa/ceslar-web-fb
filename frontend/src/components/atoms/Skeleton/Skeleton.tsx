import { Skeleton as MuiSkeleton, SkeletonProps as MuiSkeletonProps } from '@mui/material';

export type SkeletonProps = MuiSkeletonProps;

const Skeleton = ({ animation = 'wave', ...props }: SkeletonProps) => (
  <MuiSkeleton animation={animation} {...props} />
);

export default Skeleton;
