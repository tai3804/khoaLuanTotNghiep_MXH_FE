import type { Theme, SxProps } from '@mui/material/styles';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export type BreadcrumbsLinkProps = React.ComponentProps<'div'> & {
  name?: string;
  href?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function BreadcrumbsLink({ href, icon, name, disabled, ...other }: BreadcrumbsLinkProps) {
  const renderContent = () => (
    <ItemRoot disabled={disabled} {...other}>
      {icon && <ItemIcon>{icon}</ItemIcon>}
      {name}
    </ItemRoot>
  );

  if (href) {
    return (
      <Link
        component={RouterLink}
        href={href}
        color="inherit"
        sx={{
          display: 'inline-flex',
          ...(disabled && { pointerEvents: 'none' }),
        }}
      >
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
}

// ----------------------------------------------------------------------

const ItemRoot = styled('div', {
  shouldForwardProp: (prop: string) => !['disabled', 'sx'].includes(prop),
})<Pick<BreadcrumbsLinkProps, 'disabled'>>(({ disabled, theme }) => ({
  ...theme.typography.body2,
  alignItems: 'center',
  gap: theme.spacing(1),
  display: 'inline-flex',
  fontWeight: 500,
  color: theme.vars.palette.primary.dark,
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: theme.vars.palette.primary.main,
  },
  ...(disabled && {
    cursor: 'default',
    pointerEvents: 'none',
    fontWeight: 400,
    color: theme.vars.palette.text.secondary,
  }),
}));

const ItemIcon = styled('span')(() => ({
  display: 'inherit',
  /**
   * As ':first-child' for ssr
   * https://github.com/emotion-js/emotion/issues/1105#issuecomment-1126025608
   */
  '& > :first-of-type:not(style):not(:first-of-type ~ *), & > style + *': { width: 20, height: 20 },
}));
