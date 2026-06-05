import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { Iconify } from 'src/components/iconify';

import { varTap, varHover, AnimateBorder, transitionTap } from 'src/components/animate';

// ----------------------------------------------------------------------

export type AccountButtonProps = IconButtonProps & {
  photoURL: string;
  displayName: string;
};

export function AccountButton({ photoURL, displayName, sx, ...other }: AccountButtonProps) {
  const getAvatarSrc = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = 'https://ngocdaiapi.eposh.io.vn';
    const clean = url.startsWith('/') ? url.slice(1) : url;
    return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
  };
  return (
    <ButtonBase
      component={m.button}
      whileTap={varTap(0.96)}
      whileHover={varHover(1.04)}
      transition={transitionTap()}
      aria-label="Account button"
      sx={[
        {
          p: 1,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          ...sx,
        },
        ...(Array.isArray(sx) ? sx : []),
      ]}
      {...other}
    >
      <AnimateBorder
        sx={{ p: '2px', borderRadius: '50%', width: 40, height: 40 }}
        slotProps={{
          primaryBorder: { size: 60, width: '1px', sx: { color: 'primary.main' } },
          secondaryBorder: { sx: { color: 'warning.main' } },
        }}
      >
        <Avatar src={getAvatarSrc(photoURL)} alt={displayName} sx={{ width: 1, height: 1 }}>
          {displayName?.charAt(0).toUpperCase()}
        </Avatar>
      </AnimateBorder>

      <Box
        component="span"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'flex-start',
          ml: 1,
          mr: 1,
        }}
      >
        <Typography variant="subtitle2" noWrap>
          {displayName}
        </Typography>
      </Box>

      <Iconify icon="eva:arrow-ios-downward-fill" width={16} sx={{ display: { xs: 'none', md: 'block' } }} />
    </ButtonBase>
  );
}
