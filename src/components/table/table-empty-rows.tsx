import type { TableRowProps } from '@mui/material/TableRow';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

export type TableEmptyRowsProps = TableRowProps & {
  height?: number;
  emptyRows: number;
  colSpan?: number;
};

export function TableEmptyRows({ emptyRows, height, colSpan = 12, sx, ...other }: TableEmptyRowsProps) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={[
        () => ({
          ...(height && { height: height * emptyRows }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <TableCell colSpan={colSpan} />
    </TableRow>
  );
}
