import { ReactNode, ChangeEvent } from 'react';
import { Box, TextField, InputAdornment, FormHelperText } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import Typography from '../../atoms/Typography/Typography';

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
}

type SocialPlatform = keyof SocialMedia;

interface SocialMediaLinksProps {
  label?: string;
  name: string;
  value?: SocialMedia | null;
  onChange: (socialMedia: SocialMedia) => void;
  error?: string | Partial<Record<SocialPlatform, string>>;
  helperText?: string;
  description?: string;
  disabled?: boolean;
  platforms?: SocialPlatform[];
}

const PLATFORM_CONFIG: Record<SocialPlatform, { icon: ReactNode; label: string; placeholder: string }> = {
  facebook: {
    icon: <FacebookIcon />,
    label: 'Facebook',
    placeholder: 'https://facebook.com/...',
  },
  instagram: {
    icon: <InstagramIcon />,
    label: 'Instagram',
    placeholder: 'https://instagram.com/...',
  },
  youtube: {
    icon: <YouTubeIcon />,
    label: 'YouTube',
    placeholder: 'https://youtube.com/@...',
  },
  twitter: {
    icon: <TwitterIcon />,
    label: 'Twitter/X',
    placeholder: 'https://twitter.com/...',
  },
  tiktok: {
    icon: <LanguageIcon />,
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@...',
  },
  linkedin: {
    icon: <LinkedInIcon />,
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/...',
  },
  whatsapp: {
    icon: <WhatsAppIcon />,
    label: 'WhatsApp',
    placeholder: '+591...',
  },
};

const DEFAULT_PLATFORMS: SocialPlatform[] = [
  'facebook',
  'instagram',
  'youtube',
  'twitter',
  'whatsapp',
];

const SocialMediaLinks = ({
  label,
  name,
  value = {},
  onChange,
  error,
  helperText,
  description,
  disabled = false,
  platforms = DEFAULT_PLATFORMS,
}: SocialMediaLinksProps): ReactNode => {
  const handleChange = (platform: SocialPlatform) => (e: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      [platform]: e.target.value || undefined,
    });
  };

  const getErrorForPlatform = (platform: SocialPlatform): string | undefined => {
    if (typeof error === 'string') return undefined;
    if (typeof error === 'object' && error) return error[platform];
    return undefined;
  };

  const hasGeneralError = typeof error === 'string';

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          {label}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {platforms.map((platform) => {
          const config = PLATFORM_CONFIG[platform];
          const platformError = getErrorForPlatform(platform);

          return (
            <TextField
              key={platform}
              name={`${name}.${platform}`}
              value={value?.[platform] || ''}
              onChange={handleChange(platform)}
              placeholder={config.placeholder}
              error={!!platformError}
              helperText={platformError}
              disabled={disabled}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: 'action.active' }}>
                    {config.icon}
                  </InputAdornment>
                ),
              }}
            />
          );
        })}
      </Box>

      {hasGeneralError && (
        <FormHelperText error sx={{ mt: 0.5 }}>
          {error}
        </FormHelperText>
      )}
      {description && !hasGeneralError && (
        <FormHelperText sx={{ mt: 0.5 }}>{description}</FormHelperText>
      )}
      {helperText && !hasGeneralError && (
        <FormHelperText sx={{ mt: 0.5 }}>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

export default SocialMediaLinks;
