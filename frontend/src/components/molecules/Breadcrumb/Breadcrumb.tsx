import { Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import Typography from '../../atoms/Typography/Typography';
import Link from '../../atoms/Link/Link';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumb = ({ items = [], showHome = true }: BreadcrumbProps) => (
  <Breadcrumbs
    separator={<NavigateNextIcon fontSize="small" />}
    sx={{ mb: 2 }}
  >
    {showHome && (
      <Link to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
        <HomeIcon sx={{ fontSize: 18, mr: 0.5 }} />
      </Link>
    )}
    {items.map((item, index) => {
      const isLast = index === items.length - 1;
      return isLast ? (
        <Typography key={item.label} variant="body2" color="textPrimary" sx={{ fontWeight: 500 }}>
          {item.label}
        </Typography>
      ) : (
        <Link key={item.label} to={item.path || '/'} color="inherit">
          <Typography variant="body2">{item.label}</Typography>
        </Link>
      );
    })}
  </Breadcrumbs>
);

export default Breadcrumb;
