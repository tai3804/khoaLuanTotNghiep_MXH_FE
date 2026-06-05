import type { Theme, SxProps } from '@mui/material/styles';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { EmptyContent } from '../empty-content';

// ----------------------------------------------------------------------

export type TableNoDataProps = {
  notFound: boolean;
  sx?: SxProps<Theme>;
  colSpan?: number;
  title?: string;
};

export function TableNoData({ notFound, sx, colSpan = 12, title }: TableNoDataProps) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={colSpan}>
          <EmptyContent filled title={title} sx={[{ py: 10 }, ...(Array.isArray(sx) ? sx : [sx])]} />
        </TableCell>
      ) : (
        <TableCell colSpan={colSpan} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
